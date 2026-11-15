const test=require('node:test');
const assert=require('node:assert/strict');
const S=require('../site/submission-core.js');
const draft=()=>({type:'correct',name:'测试 HMD & A/B',manufacturer:'Example',deviceId:'7',configuration:'含头带',release:'2026-10-13',changes:[{field:'mass',current:'50',proposed:'<40 g',scope:'Complete headset including strap; upper bound'}],evidence:[{url:'https://example.org/spec?a=1&b=2',quote:'Mass <40 g\n1920 × 1080 per eye',kind:'official',fields:'mass',date:'2026-10-01',locator:'Specifications'}],reason:'A matching source gives an upper bound.',confirmed:true});
test('preserves source inequalities, multilingual quotes and stable identity',()=>{
  const d=draft();assert.deepEqual(S.validate(d),[]);const issue=S.markdown(d);
  assert.match(issue.body,/Proposed value or evidence addition: <40 g/);
  assert.match(issue.body,/> Mass <40 g\n> 1920 × 1080 per eye/);
  assert.match(issue.body,/Stable ID: 7/);
});
test('validates incomplete evidence and unsafe source protocols',()=>{
  const d=draft();d.evidence[0].url='javascript:alert(1)';d.evidence[0].quote='';d.confirmed=false;
  assert.deepEqual(S.validate(d),['evidence','confirmed']);
  assert.equal(S.validURL('https://user:secret@example.com'),false);
});
test('corrections require a stable ID and additions require a manufacturer',()=>{
  const d=draft();d.deviceId='';assert.ok(S.validate(d).includes('device'));
  d.type='add';d.manufacturer='';assert.ok(S.validate(d).includes('manufacturer'));
});
test('round trips GitHub URL title and body without loss',()=>{
  const issue=S.markdown(draft()),target=S.githubLink({repository:'sample/hmd-database'},issue),url=new URL(target.url);
  assert.equal(url.origin,'https://github.com');assert.equal(url.pathname,'/sample/hmd-database/issues/new');
  assert.equal(url.searchParams.get('title'),issue.title);assert.equal(url.searchParams.get('body'),issue.body);
  assert.equal(target.needsPaste,false);
});
test('long evidence uses explicit paste fallback and preserves full draft',()=>{
  const d=draft();d.evidence[0].quote='原文 '.repeat(5000);const issue=S.markdown(d);
  const target=S.githubLink({repository:'sample/hmd-database'},issue);
  assert.equal(target.needsPaste,true);assert.ok(target.url.length<6500);assert.ok(issue.body.includes(d.evidence[0].quote.trim()));
});
test('repository validation prevents non-GitHub and malformed targets',()=>{
  for(const repository of ['','https://evil.test/x','a/b/extra','a/b?x=1'])assert.throws(()=>S.githubLink({repository},{title:'a',body:'b'}));
});

test('prefilled current mass preserves strict and inclusive bounds',()=>{
  const device={row:{mass_point_g:40,mass_value_kind:'upper_bound',mass_bound_inclusive:false},fields:[]};
  assert.equal(S.currentValue(device,'mass'),'< 40 g');
  device.row.mass_bound_inclusive=true;assert.equal(S.currentValue(device,'mass'),'≤ 40 g');
  device.row.mass_value_kind='lower_bound';assert.equal(S.currentValue(device,'mass'),'≥ 40 g');
  device.row.mass_bound_inclusive=false;assert.equal(S.currentValue(device,'mass'),'> 40 g');
  device.row.mass_point_g=null;assert.equal(S.currentValue(device,'mass'),'');
});

test('prefilled raster and mass qualifiers remain readable',()=>{
  const device={row:{w_px:1920,h_px:1080,mass_point_g:625,mass_value_kind:'range_midpoint'},fields:[]};
  assert.equal(S.currentValue(device,'raster'),'1920 × 1080 px');
  assert.match(S.currentValue(device,'mass'),/source range midpoint/);
  assert.equal(S.currentValue(device,'mass','zh'),'625 g（来源范围中点）');
  device.row.mass_value_kind='range_endpoint';
  assert.equal(S.currentValue(device,'mass','zh'),'625 g（来源范围端点）');
  device.row.mass_value_kind='upper_bound';
  assert.equal(S.currentValue(device,'mass','zh'),'上界：625 g');
  device.row.mass_value_kind='lower_bound';
  assert.equal(S.currentValue(device,'mass','zh'),'下界：625 g');
});

test('Issue preview follows language without rewriting submitted values or source quotations',()=>{
  const d=draft(),original=JSON.stringify(d);
  const zh=S.markdown(d,'zh'),en=S.markdown(d,'en');
  assert.match(zh.body,/## 设备数据贡献/);assert.match(zh.body,/## 支持证据/);
  assert.doesNotMatch(zh.body,/## Device contribution|## Supporting evidence|Publisher type:/);
  assert.match(en.body,/## Device contribution/);
  for(const output of [zh,en]){
    for(const line of d.evidence[0].quote.trim().split('\n'))assert.ok(output.body.includes('> '+line));
    assert.ok(output.body.includes(d.changes[0].proposed.trim()));
  }
  assert.equal(JSON.stringify(d),original);
});

test('access dates use ISO calendar dates and reject impossible days',()=>{
  for(const date of ['',undefined,'2024-02-29','2026-10-26']){
    const d=draft();d.evidence[0].date=date;assert.deepEqual(S.validate(d),[]);
  }
  for(const date of ['2025-02-29','2026-02-30','2026-13-01','10/26/2026','2026年10月26日','0000-01-01']){
    const d=draft();d.evidence[0].date=date;assert.ok(S.validate(d).includes('date'),date);
  }
});

test('prefilled device category follows the selected form language',()=>{
  const device={row:{category:'一体机'},fields:[{key:'category',value:'一体机'}]};
  assert.equal(S.currentValue(device,'category','en'),'Standalone VR');
  assert.equal(S.currentValue(device,'category','zh'),'一体机');
});

test('year and structured optical descriptions localize without changing stored values',()=>{
  const original='自由曲面棱镜；已识别的独立结构，SARC 使用全局校正';
  const device={row:{},fields:[{key:'year',value:2021,unit:'年'},{key:'optics',value:{physical:'freeform_prism',description:original}}]};
  const translations={[original]:'Freeform prism; a distinct identified structure using the SARC global correction'};
  assert.equal(S.currentValue(device,'year','en'),'2021');
  assert.equal(S.currentValue(device,'year','zh'),'2021 年');
  assert.equal(JSON.parse(S.currentValue(device,'optics','en',translations)).description,translations[original]);
  assert.equal(JSON.parse(S.currentValue(device,'optics','zh',translations)).description,original);
  assert.equal(device.fields[1].value.description,original);
});

test('English correction prefills cover every published device without changing originals',()=>{
  const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
  const context=vm.createContext({window:{}}),site=path.join(__dirname,'../site');
  for(const name of ['data.js','auxiliary.js','project-text-en.js'])vm.runInContext(fs.readFileSync(path.join(site,name),'utf8'),context);
  const {HMD_DATA,HMD_AUXILIARY,HMD_PROJECT_EN}=context.window;
  const devices=[...HMD_DATA.devices,...HMD_AUXILIARY.missing.devices,...HMD_AUXILIARY.historical.devices];
  for(const device of devices){
    const before=JSON.stringify(device);
    for(const field of device.fields){
      assert.ok(S.fields.some(([key])=>key===field.key),`Missing correction option: ${device.row.device_id}/${field.key}`);
      assert.doesNotMatch(S.currentValue(device,field.key,'en',HMD_PROJECT_EN),/[\u3400-\u9fff]/,`${device.row.device_id}/${field.key}`);
    }
    assert.equal(JSON.stringify(device),before);
  }
});

test('extended correction fields retain their current values and readable preview labels',()=>{
  const device={row:{},fields:[{key:'mass_bare',value:107,unit:'g'},{key:'fov_nominal',value:100,unit:'degrees_horizontal'}]};
  assert.equal(S.currentValue(device,'mass_bare'),'107 g');
  assert.equal(S.currentValue(device,'fov_nominal','en',{degrees_horizontal:'degrees horizontal'}),'100 degrees horizontal');
  const d=draft();d.changes[0].field='mass_bare';d.changes[0].current=S.currentValue(device,'mass_bare');
  assert.match(S.markdown(d).body,/### 1\. Bare headset mass\n- Current value: 107 g/);
  assert.match(S.markdown(d,'zh').body,/### 1\. 裸机质量（仅头显）/);
});
