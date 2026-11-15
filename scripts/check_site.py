"""Validate website checksums, dataset calculations and source links."""
from pathlib import Path
import hashlib
import json
import math
import re

ROOT = Path(__file__).resolve().parents[1]
SITE = ROOT/'site'

def main():
    manifest = json.loads((SITE/'release_manifest.json').read_text(encoding='utf-8'))
    total = sum(p.stat().st_size for p in SITE.rglob('*') if p.is_file())
    for relative, expected in manifest['sha256'].items():
        path = (SITE/relative).resolve()
        assert path.is_relative_to(SITE.resolve()) and path.is_file(), relative
        assert hashlib.sha256(path.read_bytes()).hexdigest() == expected, relative
    for file in ['data.js', 'auxiliary.js']:
        text = (SITE/file).read_text(encoding='utf-8')
        assert 'data/audit/' not in text, 'Unpublished research-archive path in public data'
        data=json.loads(text.split('=',1)[1].rstrip(';\n'))
        for relative in set(re.findall(r'images/[A-Za-z0-9_./-]+\.(?:png|webp|jpe?g|avif)', text)):
            assert (SITE/relative).is_file(), relative
        datasets=[data] if file=='data.js' else [data['missing'],data['historical']]
        expected_counts = [manifest['counts']['main']] if file == 'data.js' else [manifest['counts']['missing'], manifest['counts']['historical']]
        image_links=set()
        for dataset, expected_count in zip(datasets, expected_counts):
            assert len(dataset['devices']) == expected_count
            for device in dataset['devices']:
                row = device['row']
                assert 'browser_evidence_packet' not in row, 'Unpublished audit pointer in public data'
                derivations = [row.get('ppd_derivation') or {}] + [field.get('derivation') or {} for field in device['fields']]
                for derivation in derivations:
                    if derivation.get('method') != 'sarc':
                        continue
                    model_path = (ROOT / derivation['model_path']).resolve()
                    assert model_path.is_relative_to(ROOT.resolve()) and model_path.is_file()
                    assert hashlib.sha256(model_path.read_bytes()).hexdigest() == derivation['model_sha256']
                    model = json.loads(model_path.read_text(encoding='utf-8'))
                    offset = model['groups'][derivation['calibration_group']]['log2_multiplier']
                    assert offset == derivation['log2_multiplier']
                    assert math.isclose(derivation['calibration_q'] * 2**offset, row['ppd_working'], abs_tol=1e-10)
                    interval = model['residual_interval']
                    sigma = interval['sigma_log2']
                    factor = 2**(interval['normal_multiplier'] * sigma)
                    assert math.isclose(row['ppd_estimate_sigma_log2'], sigma, abs_tol=1e-12)
                    assert math.isclose(row['ppd_estimate_low'], row['ppd_working']/factor, abs_tol=1e-10)
                    assert math.isclose(row['ppd_estimate_high'], row['ppd_working']*factor, abs_tol=1e-10)
                if device['row'].get('image_local_path'):image_links.add(device['row']['image_local_path'])
                for field in device['fields']:
                    for capture in field['captures']:
                        image_links.update(capture[k] for k in ['raw','highlighted'] if capture.get(k))
        for relative in image_links:
            assert (SITE/relative).is_file(), relative
    for page in SITE.glob('*.html'):
        for link in re.findall(r'(?:href|src)="([^"#]+)"', page.read_text(encoding='utf-8')):
            if re.match(r'(?:https?:|mailto:|data:|#)', link): continue
            assert not link.startswith('/'), f'Root-relative link: {page.name}: {link}'
            assert (SITE/link.split('?')[0].split('#')[0]).exists(), f'{page.name}: {link}'
    print(json.dumps({'status':'passed','site_bytes':total,
                      'checked_files':len(manifest['sha256']),'counts':manifest['counts']}, indent=2))

if __name__ == '__main__': main()
