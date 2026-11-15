// Check bilingual UI state, device fields and source quotations.
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const path=require('node:path');
const site=path.join(__dirname,'../site');
function setup(savedLanguage,initialHash=''){
 const nodes=new Map(),storage=new Map(savedLanguage?[['hmd-language',savedLanguage]]:[]);
 function node(selector){if(!nodes.has(selector))nodes.set(selector,{value:'',textContent:'',innerHTML:'',open:false,hidden:false,style:{},listeners:{},naturalWidth:1000,clientWidth:1000,addEventListener(name,fn){this.listeners[name]=fn;},showModal(){this.open=true;},close(){this.open=false;},insertAdjacentHTML(_,html){this.innerHTML+=html;},scrollIntoView(){}});return nodes.get(selector);}
 const html=fs.readFileSync(path.join(site,'index.html'),'utf8');
 const summaryTag=html.match(/<p\b[^>]*id="release-summary"[^>]*>/)[0];
 const summary=node('#release-summary');summary.dataset={zh:'正在加载当前发布数据…',en:'Loading the current release…'};
 const context=vm.createContext({console,URL,Promise,addEventListener(){},document:{querySelector:node,querySelectorAll:selector=>selector==='[data-i18n]'&&summaryTag.includes('data-i18n')?[summary]:[],documentElement:{},addEventListener(){}},localStorage:{getItem:key=>storage.get(key),setItem:(key,value)=>storage.set(key,value)},history:{replaceState(_,__,hash){context.location.hash=hash;}},location:{hash:initialHash,reload(){}},MouseEvent:function(){}});
 context.window=context;
 node('#metric').value='unique_pages';node('#dataset-view').value='main';
 for(const file of ['data.js','auxiliary.js','project-text-en.js','project-text-zh.js','i18n.js','app.js']){
  if(file==='app.js'&&initialHash){const merged=context.HMD_DATA.devices.find(d=>String(d.row.device_id)==='29');merged.row.aliases=['Epson Moverio BT-40S'];merged.row.merged_device_ids=['245'];}
  vm.runInContext(fs.readFileSync(path.join(site,file),'utf8'),context,{filename:file});
 }
 return {context,node,storage,run:code=>vm.runInContext(code,context)};
}
(async()=>{
 const fresh=setup();await Promise.resolve();assert.equal(fresh.run('HMDI18n.language'),'en');
 const a=setup('zh');await Promise.resolve();
 assert.equal(a.run('HMDI18n.language'),'zh');
 assert.equal(a.run("HMDI18n.source('other','other')"),'其他来源');
 assert.equal(a.run("fieldValue({key:'year',value:2017,unit:'年'})"),'2017 年');
 assert.match(a.node('#release-summary').textContent,/当前发布/);
 assert.ok(a.node('#release-summary').textContent.includes(String(a.context.HMD_DATA.devices.length)));
 assert.equal(a.node('#formal-total').textContent,a.context.HMD_DATA.devices.length);
 assert.equal(/id="formal-total">\d+</.test(fs.readFileSync(path.join(site,'index.html'),'utf8')),false);
 for(const [key,label] of [['lens_projection','镜片投影'],['lens_optics','透镜光学'],['non_fresnel','非菲涅尔']])assert.equal(a.run(`opticsValue({row:{physical_optics:${JSON.stringify(key)}}})`),label);
 assert.match(a.node('#category').innerHTML,/value="一体机">一体机VR/);
 const first=a.context.HMD_DATA.devices.find(d=>d.fields.some(f=>f.quote));
 a.run(`openDevice(${first.row.device_id},${JSON.stringify(first.fields.find(f=>f.quote).key)})`);
 const quote=first.fields.find(f=>f.quote).quote;
 assert.ok(a.node('#evidence').innerHTML.includes(a.run(`esc(${JSON.stringify(quote)})`)));
 a.node('#category').value='一体机';a.node('#search').value='Quest';a.run('renderTable()');
 const count=a.node('#result-count').textContent;
 a.node('#language').value='en';a.node('#language').listeners.change();
 assert.equal(a.storage.get('hmd-language'),'en');
 assert.equal(a.node('#category').value,'一体机');assert.equal(a.node('#search').value,'Quest');assert.equal(a.node('#result-count').textContent,count);
 assert.match(a.node('#category').innerHTML,/value="一体机">Standalone VR/);
 assert.equal(a.node('#detail').open,true);assert.equal(a.node('#device-title').textContent,first.row.name);
 assert.ok(a.node('#evidence').innerHTML.includes(a.run(`esc(${JSON.stringify(quote)})`)));
 assert.match(a.node('#evidence').innerHTML,/Original source quotation/);
 assert.match(a.node('#release-summary').textContent,/Current release/);
 assert.equal(a.run("HMDI18n.source('other','other')"),'Other sources');
 assert.match(a.run("badge('other')"),/Other sources/);
 assert.equal(a.run("fieldValue({key:'year',value:2017,unit:'年'})"),'2017');
 assert.equal(a.run("fieldValue({key:'announcement_year',value:2017,unit:'年'})"),'2017');
 assert.equal(a.run("fieldValue({key:'fov',value:108,unit:'degrees_horizontal'})"),'108 horizontal degrees');
 assert.equal(a.run("projectText('physical_per_eye')"),'Physical pixels per eye');
 assert.doesNotMatch(a.run("projectText('with_strap_approximate_range_midpoint; headset_fitted_with_face_mask; not_bare_headset')"),/_/);
 assert.match(a.node('#evidence').innerHTML,/Source captures/);
 assert.doesNotMatch(a.node('#evidence').innerHTML,/Actual browser captures/);
 for(const dict of ['labels','yearEvents','kindLabel','opticsLabels'])assert.equal(a.run(`Object.values(${dict}).some(value=>/[\\u3400-\\u9fff]/.test(value))`),false,dict+' has untranslated English labels');
 assert.equal(a.run('opticsValue({row:{physical_optics:"pancake"}})'),'Pancake');
 for(const [key,label] of [['lens_projection','Lens projection'],['lens_optics','Lens optics'],['non_fresnel','Non-Fresnel']])assert.equal(a.run(`opticsValue({row:{physical_optics:${JSON.stringify(key)}}})`),label);
 assert.equal(a.run('massDisplay({mass_point_g:40,mass_value_kind:"upper_bound",mass_bound_inclusive:false})'),'< 40 g');
 const captured=first.fields.find(f=>f.captures.length);
 if(captured){a.run(`openImage(${JSON.stringify(captured.key)},0);imageMode='raw';showImage();zoom=2`);const image=a.node('#full-image').src;
  a.node('#detail-language').listeners.click();assert.equal(a.node('#viewer').open,true);assert.equal(a.node('#full-image').src,image);assert.equal(a.run('imageMode'),'raw');assert.equal(a.run('zoom'),2);a.node('#viewer').open=false;
 }
 const photoDevice=a.context.HMD_DATA.devices.find(d=>d.row.image_local_path);
 a.run(`openDevice(${photoDevice.row.device_id});changeLanguage('en')`);
 a.node('#device-facts').listeners.click({target:{id:'device-photo'}});
 assert.equal(a.node('#image-toggle').hidden,true);
 assert.doesNotMatch(a.node('#image-time').textContent,/Evidence time|证据时间/);
 const photo=a.node('#full-image').src;
 a.node('#viewer-language').listeners.click();
 assert.equal(a.node('#full-image').src,photo);
 assert.match(a.node('#image-title').textContent,/设备页面图/);
 assert.doesNotMatch(a.node('#image-time').textContent,/Evidence time|证据时间|Device page image/);
 const evidencePhoto=photoDevice.fields.find(f=>f.captures.some(c=>c.raw&&c.highlighted&&c.raw!==c.highlighted));
 if(evidencePhoto){const index=evidencePhoto.captures.findIndex(c=>c.raw&&c.highlighted&&c.raw!==c.highlighted);
  a.run(`openImage(${JSON.stringify(evidencePhoto.key)},${index})`);
  assert.equal(a.node('#image-toggle').hidden,false);
  assert.match(a.node('#image-time').textContent,/证据时间/);
  const highlighted=a.node('#full-image').src;a.node('#image-toggle').onclick();assert.notEqual(a.node('#full-image').src,highlighted);
 }
 a.node('#viewer').open=false;
 a.node('#language').value='zh';a.node('#language').listeners.change();
 assert.match(a.node('#evidence').innerHTML,/采用依据/);
 assert.doesNotMatch(a.node('#evidence').innerHTML,/Adoption rationale/);
 assert.match(a.node('#device-id').textContent,/设备/);
 assert.equal(a.run("projectText('complete_headset_excluding_cable')"),'整机头显，不含线缆');
 assert.equal(a.run("projectText('manufacturer_physical_display_pixels_per_eye')"),'厂商报告的每眼物理显示像素');
 assert.match(a.run("projectText('PPD=20. Not measured PPD; nominal panel pixels and adopted FOV geometry.')"),/^PPD=20\. 并非实测 PPD/);
 assert.equal(a.run("projectText('https://example.test/unknown/headset')"),'https://example.test/unknown/headset');
 assert.equal(a.run('opticsValue({row:{physical_optics:"birdbath"}})'),'鸟浴式（Birdbath）');
 const b=setup('en');await Promise.resolve();assert.match(b.node('#category').innerHTML,/Standalone VR/);
 // A central PPD must be shown beside central geometry, with whole-device values explicitly separate.
 for(const [id,raster,fov] of [['156','1920 × 1920','27° × 27°'],['158','1920 × 1920','27° × 27°'],['154','1920 × 1080','30°']]){
  const expr=`db.devices.find(d=>String(d.row.device_id)==='${id}')`;
  assert.ok(a.run(`rasterCell(${expr})`).includes(raster));
  assert.ok(a.run(`fovCell(${expr})`).includes(fov));
  assert.ok(a.run(`fovCell(${expr})`).includes('整机：'));
  assert.ok(a.run(`rasterCell(${expr})`).includes('data-initial-field="ppd_calibration_region"'));
 }
 const hlRaster=a.run("rasterCell(db.devices.find(d=>String(d.row.device_id)==='210'))");
 assert.match(hlRaster,/1440 × 936/);
 assert.match(hlRaster,/每眼 · 宽 × 高/);
 assert.doesNotMatch(hlRaster,/非物理像素|渲染目标/);
 b.run("changeLanguage('zh')");
 assert.equal(b.run("fieldLabel('ppd_calibration_region')"),'中心区域分辨率与 FOV');
 b.run("changeLanguage('en')");
 assert.equal(b.run("fieldLabel('ppd_calibration_region')"),'Central-region raster and FOV');
 const currentReference=b.context.HMD_DATA.devices.find(d=>b.run(`isTrue(${JSON.stringify(d.row.calibration_reference_eligible)})`));
 assert.ok(currentReference);
 for(const [language,label] of [['en','Calibration reference'],['zh','校准参考']]){
  b.run(`HMDI18n.setLanguage('${language}');switchDataset('main');openDevice(${currentReference.row.device_id})`);
  assert.ok(b.node('#device-facts').innerHTML.includes(label),'current main reference badge missing');
  b.run("switchDataset('historical');openDevice(223)");
  assert.equal(b.node('#device-title').textContent,'Sensics piSight');
  assert.ok(!b.node('#device-facts').innerHTML.includes(label),'historical device shown as a current calibration reference');
 }
 const merged=setup('zh','#device-245');await Promise.resolve();
 assert.equal(merged.node('#detail').open,true);assert.equal(String(merged.run('selected.row.device_id')),'29');
 assert.equal(merged.context.location.hash,'#device-29');assert.match(merged.node('#device-facts').innerHTML,/别名: Epson Moverio BT-40S/);
 merged.node('#search').value='Epson Moverio BT-40S';merged.run('renderTable()');assert.match(merged.node('#devices').innerHTML,/Epson Moverio BT-40S/);
 merged.node('#search').value='245';merged.run('renderTable()');assert.match(merged.node('#devices').innerHTML,/ID 29/);
 merged.run("changeLanguage('en')");assert.match(merged.node('#device-facts').innerHTML,/Aliases: Epson Moverio BT-40S/);
 assert.equal(merged.run('openDevice(999999)'),false);
 const c=setup('invalid');await Promise.resolve();assert.equal(c.run('HMDI18n.language'),'en');
 // Exercise every field renderer in each dataset and language.
 let fields=0;
 for(const language of ['zh','en']){a.run(`HMDI18n.setLanguage('${language}')`);for(const dataset of ['main','missing','historical']){
  a.run(`switchDataset('${dataset}')`);
  const devices=a.run('db.devices');
  for(const d of devices)for(const f of d.fields){
   a.run(`openDevice(${d.row.device_id},${JSON.stringify(f.key)})`);fields++;
   if(language==='en'){
    const html=a.node('#evidence').innerHTML;
    assert.doesNotMatch(f.quote||'',/补充依据\s*[:：]/,'project connector inside original quotation');
    // Actual quotations may be multilingual; project-authored notes must be English.
    let projectHTML=html.replace(/<blockquote lang="und">[\s\S]*?<\/blockquote>/g,'');
    // Preserve the exact headings readers need to locate these Japanese sources.
    const sourceHeadings={'missing/226/mass':'Specification section > 質量','missing/226/fov':'Specification section > 水平画角','missing/298/optics':'光学系 / variable-focus configuration'};
    const heading=sourceHeadings[`${dataset}/${d.row.device_id}/${f.key}`];
    if(heading){
     assert.ok(projectHTML.includes(a.run(`esc(${JSON.stringify(heading)})`)));
     projectHTML=projectHTML.replaceAll(a.run(`esc(${JSON.stringify(heading)})`),'');
    }
    assert.doesNotMatch(projectHTML,/[\u3400-\u9fff]/,`${dataset}/${d.row.device_id}/${f.key}: English project text`);
    if(f.quote)assert.ok(html.includes(a.run(`esc(${JSON.stringify(f.quote)})`)),'source quote changed');
    for(const value of [d.row.gap_note,d.row.mass_scope,d.row.image_caption,d.row.category_evidence_reason,...f.captures.flatMap(c=>[c.caption,c.time_basis])]){
     assert.doesNotMatch(a.run(`projectText(${JSON.stringify(value??'')})`),/[\u3400-\u9fff]/,`${d.row.device_id}: project metadata`);
    }
   }else{
    const translated=a.run(`projectText(${JSON.stringify(f.reason??'')})`);
    assert.doesNotMatch(translated,/Not measured PPD;|Model residual interval excludes|Third-party PPD is retained|SARC prepared inputs require/,'untranslated calculation/review explanation');
    assert.match(a.node('#evidence').innerHTML,/采用依据/);
    if(f.quote)assert.ok(a.node('#evidence').innerHTML.includes(a.run(`esc(${JSON.stringify(f.quote)})`)),'Chinese mode source quote changed');
   }
  }
 }}
 console.log(JSON.stringify({status:'passed',field_renderings:fields,checks:['runtime release summary survives static translation','runtime counts without fixed dataset size','physical optical labels in both languages','aliases searchable and displayed without translating names','merged device deep links canonicalize to current ID','default English', 'remembered Chinese', 'invalid preference falls back to English','remembered language','stable category filter values','filter result parity','open detail and focused field preserved','device names and original quotations unchanged','mass inequality preserved','all datasets and fields render in both languages']}));
})().catch(error=>{console.error(error);process.exitCode=1;});
