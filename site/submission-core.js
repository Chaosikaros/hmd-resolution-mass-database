(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.HMDSubmission = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';
  const types = {add: 'New device', correct: 'Data correction', evidence: 'Additional evidence'};
  const fields = [
    ['mass', '头戴整机质量', 'Head-worn mass'], ['mass_bare', '裸机质量（仅头显）', 'Bare headset mass'],
    ['mass_component_exclusions', '质量组成与排除项', 'Mass components and exclusions'],
    ['ppd', 'PPD', 'PPD'], ['manufacturer_reported_ppd', '厂商报告 PPD', 'Manufacturer-reported PPD'],
    ['third_party_ppd_reference', '第三方 PPD（仅供参考）', 'Third-party PPD (reference only)'],
    ['ppd_calibration_region', 'PPD 校准区域', 'PPD calibration region'], ['raster', '每眼像素', 'Pixels per eye'],
    ['fov', 'FOV', 'FOV'], ['fov_nominal', '补充 FOV 规格', 'Additional FOV specification'],
    ['year', '年份', 'Year'], ['announcement_year', '公告年份', 'Announcement year'],
    ['optics', '光学结构', 'Optics'], ['display', '显示类型', 'Display type'], ['category', '设备类别', 'Device category'],
    ['configuration', '型号与配置', 'Model and configuration'], ['family', '设备系列', 'Device family'],
    ['family_id', '设备系列标识', 'Device family ID'], ['name', '设备名称', 'Device name'],
    ['manufacturer', '制造商', 'Manufacturer'], ['other', '其他字段', 'Other field']
  ];
  const clean = value => String(value ?? '').trim();
  const validURL = value => {
    try { const u = new URL(value); return ['https:', 'http:'].includes(u.protocol) && !u.username && !u.password; }
    catch { return false; }
  };
  const validDate = value => {
    const date = clean(value);
    if (!date) return true;
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || date.startsWith('0000')) return false;
    const parsed = new Date(date + 'T00:00:00Z');
    return Number.isFinite(parsed.getTime()) && parsed.toISOString().slice(0, 10) === date;
  };
  function currentValue(device, key, language = 'en', translations = {}, chineseTranslations = {}) {
    if (!device) return '';
    const tr = (zh, en) => language === 'zh' ? zh : en;
    const row = device.row || {}, field = device.fields?.find(f => f.key === key);
    if (key === 'mass') {
      if (row.mass_point_g == null) return '';
      const kind = row.mass_value_kind || '';
      const prefix = kind.includes('upper_bound') ? (row.mass_bound_inclusive === false ? '< ' : row.mass_bound_inclusive === true ? '≤ ' : tr('上界：', 'Upper bound: '))
        : kind.includes('lower_bound') ? (row.mass_bound_inclusive === false ? '> ' : row.mass_bound_inclusive === true ? '≥ ' : tr('下界：', 'Lower bound: '))
        : /estimate|approximate/.test(kind) ? '≈ ' : '';
      const suffix = kind === 'range_midpoint' ? tr('（来源范围中点）', ' (source range midpoint)') : kind === 'range_endpoint' ? tr('（来源范围端点）', ' (source range endpoint)') : '';
      return prefix + row.mass_point_g + ' g' + suffix;
    }
    if (key === 'raster') return row.w_px != null && row.h_px != null ? `${row.w_px} × ${row.h_px} px` : '';
    if (key === 'ppd') return row.ppd_working == null ? '' : row.ppd_working + ' PPD';
    if (key === 'name' || key === 'manufacturer') return clean(row[key]);
    if (key === 'category' && language === 'en') return ({'一体机':'Standalone VR','PC VR':'PC VR','AR':'AR'})[row.category] || clean(row.category);
    if (field?.value == null) return '';
    const localize = value => typeof value === 'string' ? (language === 'en' ? translations : chineseTranslations)[value] ?? value : value;
    const value = typeof field.value === 'object' ? JSON.stringify(field.value, (_, value) => localize(value)) : String(localize(field.value));
    const unit = language === 'en' && field.unit === '年' ? '' : localize(field.unit);
    return value + (unit ? ' ' + unit : '');
  }
  function validate(draft) {
    const errors = [];
    if (!Object.hasOwn(types, draft.type)) errors.push('type');
    if (!clean(draft.name)) errors.push('name');
    if (draft.type === 'add' && !clean(draft.manufacturer)) errors.push('manufacturer');
    if (draft.type !== 'add' && !clean(draft.deviceId)) errors.push('device');
    if (!draft.changes?.length || draft.changes.some(c => !clean(c.field) || !clean(c.proposed) || !clean(c.scope))) errors.push('changes');
    if (!draft.evidence?.length || draft.evidence.some(e => !validURL(e.url) || !clean(e.quote) || !clean(e.fields))) errors.push('evidence');
    if (draft.evidence?.some(e => !validDate(e.date))) errors.push('date');
    if (!clean(draft.reason)) errors.push('reason');
    if (!draft.confirmed) errors.push('confirmed');
    return errors;
  }
  function markdown(draft, language = 'en') {
    const tr = (zh, en) => language === 'zh' ? zh : en;
    const type = language === 'zh' ? ({add:'新增设备',correct:'数据修正',evidence:'补充证据'})[draft.type] : types[draft.type];
    const field = key => fields.find(([id]) => id === key)?.[language === 'zh' ? 1 : 2] || key;
    const publisher = key => language === 'zh' ? ({official:'官方',third_party:'第三方',archived:'网页存档',other:'其他可追溯来源'})[key] || key : key;
    const missing = tr('未提供','Not supplied');
    const title = `[${type || tr('设备数据贡献','Device contribution')}] ${clean(draft.name)}`;
    const lines = [
      tr('## 设备数据贡献','## Device contribution'), '',
      `- ${tr('提交类型','Request')}: ${type}`, `- ${tr('设备','Device')}: ${clean(draft.name)}`,
      `- ${tr('稳定 ID','Stable ID')}: ${clean(draft.deviceId) || tr('新增设备，审核后分配','New device — assigned after review')}`,
      `- ${tr('制造商','Manufacturer')}: ${clean(draft.manufacturer) || missing}`,
      `- ${tr('型号／版本／配置','Model / version / configuration')}: ${clean(draft.configuration) || missing}`,
      `- ${tr('数据集版本','Dataset release')}: ${clean(draft.release)}`, '', tr('## 拟修改内容','## Proposed changes'), ''
    ];
    (draft.changes || []).forEach((c, i) => lines.push(
      `### ${i + 1}. ${field(clean(c.field))}`, `- ${tr('当前采用值','Current value')}: ${clean(c.current) || tr('未记录／新增设备','Not recorded / new device')}`,
      `- ${tr('拟修改值或新增证据','Proposed value or evidence addition')}: ${clean(c.proposed)}`,
      `- ${tr('单位、轴向、显示区域、组件范围及值类型','Unit, axis, display region, assembly and value kind')}: ${clean(c.scope)}`, ''
    ));
    lines.push(tr('## 支持证据','## Supporting evidence'), '');
    (draft.evidence || []).forEach((e, i) => lines.push(
      `### ${tr('来源','Source')} ${i + 1}`, `- URL: ${clean(e.url)}`, `- ${tr('来源类别','Publisher type')}: ${publisher(clean(e.kind))}`,
      `- ${tr('支持字段','Supports fields')}: ${clean(e.fields)}`, `- ${tr('页码／章节／表格位置','Page / section / table')}: ${clean(e.locator) || missing}`,
      `- ${tr('实际访问／截图日期','Actual access / capture date')}: ${clean(e.date) || missing}`, '',
      tr('来源原句：','Exact source quotation:'), ...clean(e.quote).split('\n').map(line => '> ' + line), ''
    ));
    lines.push(tr('## 理由与适用范围','## Reason and scope'), '', clean(draft.reason), '', tr('## 证据附件','## Evidence attachments'), '',
      tr('请在 GitHub 此处附上实际来源截图或 PDF。请包含未高亮原图及相应高亮副本，不要替换来源文字。','Attach actual source screenshots or PDFs here in GitHub. Include the unhighlighted capture and any highlighted copy; do not replace the source text.'),
      '', tr('## 审核确认','## Review acknowledgement'), '',
      tr('- [x] 此提交供维护者审核，不会直接修改当前采用数据。','- [x] This is a proposal for maintainer review. Submission does not change adopted data.'),
      tr('- [x] 已保留来源原句、配置、不等式及参数口径。','- [x] Source quotations, configuration, inequalities and scope are preserved.'),
      '', tr('通过 HRMD（头戴式显示设备分辨率与质量数据库）贡献表单提交。','Submitted through the HMD Resolution and Mass Database (HRMD) contribution form.'));
    return {title, body: lines.join('\n')};
  }
  function githubLink(config, issue) {
    if (!/^[A-Za-z0-9](?:[A-Za-z0-9-]*[A-Za-z0-9])?\/[A-Za-z0-9_.-]+$/.test(config.repository || '')) throw new Error('A valid owner/repository is required.');
    const url = new URL(`https://github.com/${config.repository}/issues/new`);
    url.searchParams.set('template', 'device_submission.md');
    url.searchParams.set('title', issue.title);
    url.searchParams.set('body', issue.body);
    const needsPaste = url.href.length > 6500;
    if (needsPaste) url.searchParams.set('body', 'Please paste the complete contribution copied or downloaded from the HRMD website here, then attach the source screenshots.');
    return {url: url.href, needsPaste};
  }
  return {types, fields, validURL, validDate, currentValue, validate, markdown, githubLink};
});
