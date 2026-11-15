(() => {
  'use strict';
  const $ = s => document.querySelector(s);
  const allDevices = [...HMD_DATA.devices, ...HMD_AUXILIARY.missing.devices, ...HMD_AUXILIARY.historical.devices];
  let language = 'en';
  try { language = localStorage.getItem('hmd-language') === 'zh' ? 'zh' : 'en'; } catch {}
  const tr = (zh, en) => language === 'zh' ? zh : en;
  const fields = HMDSubmission.fields;
  const currentDevice = () => allDevices.find(d => String(d.row.device_id) === $('#existing-device').value);
  let issue, errorMessage, draftStatus;
  function translate() {
    document.documentElement.lang = language === 'zh' ? 'zh-CN' : 'en';
    document.title = tr('贡献设备数据 · HRMD', 'Contribute device data · HRMD');
    document.querySelectorAll('[data-zh][data-en]').forEach(e => { e.textContent = e.dataset[language]; });
    $('#form-language').value = language;
    $('#form-language').setAttribute('aria-label',tr('语言','Language'));
    $('#configuration').placeholder = tr('例如：2024 / 标准头带 / 含电池', 'e.g. 2024 / standard strap / battery included');
    document.querySelectorAll('.change-current').forEach(e => e.setAttribute('aria-label',tr('当前采用值','Current adopted value')));
    document.querySelectorAll('.change-field').forEach(e => e.dispatchEvent(new Event('change')));
    $('#mode-note').textContent = tr('GitHub Issues · 需登录 GitHub 后确认提交', 'GitHub Issues · sign in to review and submit');
    $('#submit-button').textContent = tr('提交到 GitHub →', 'Continue to GitHub →');
    if (HMD_SITE_CONFIG.repository) $('#issues-link').href = `https://github.com/${HMD_SITE_CONFIG.repository}/issues`;
    if (issue) preview();
    if (errorMessage && !$('#errors').hidden) $('#errors').textContent = errorMessage();
    if (draftStatus) $('#draft-status').textContent = draftStatus();
  }
  function element(tag, attrs = {}, text) {
    const e = document.createElement(tag);
    for (const [key, value] of Object.entries(attrs)) e.setAttribute(key, value);
    if (text) e.textContent = text;
    return e;
  }
  function label(zh, en, input) {
    const l = element('label');
    l.append(element('span', {'data-zh': zh, 'data-en': en}, tr(zh,en)), input);
    return l;
  }
  function addChange(saved = {}) {
    const card = element('div', {class:'repeated-card change-entry'});
    const top = element('div', {class:'repeated-top'});
    top.append(element('strong', {'data-zh':'字段', 'data-en':'Field'},tr('字段','Field')));
    const remove = element('button', {type:'button', class:'remove-entry', 'data-zh':'移除', 'data-en':'Remove'},tr('移除','Remove'));
    remove.onclick = () => card.remove(); top.append(remove); card.append(top);
    const select = element('select', {class:'change-field'});
    fields.forEach(([key,zh,en]) => select.append(element('option',{value:key,'data-zh':zh,'data-en':en},tr(zh,en))));
    select.value = fields.some(([key]) => key === (saved.field || 'mass')) ? saved.field || 'mass' : 'other';
    const current = element('input',{class:'change-current',readonly:'', 'aria-label':tr('当前采用值','Current adopted value')});
    const proposed = element('textarea',{class:'change-proposed',rows:'2',maxlength:'2000',required:''}); proposed.value=saved.proposed||'';
    const scope = element('input',{class:'change-scope',maxlength:'500',required:''}); scope.value=saved.scope||'';
    const fill = () => {
      current.value = $('#request-type').value==='add'?'':HMDSubmission.currentValue(currentDevice(), select.value, language, window.HMD_PROJECT_EN, window.HMD_PROJECT_ZH);
    };
    select.onchange=fill;
    const grid=element('div',{class:'field-grid'});
    grid.append(label('字段','Field',select),label('当前采用值（自动带入）','Current value (from dataset)',current));
    card.append(grid,label('拟修改值或新增证据的内容 *','Proposed value or evidence addition *',proposed),label('单位与口径 *（如：g、含头带；水平 °；中心区域）','Units and scope * (e.g. g, including strap; horizontal °; central region)',scope));
    $('#changes').append(card);fill();
  }
  function addSource(saved = {}) {
    const card=element('div',{class:'repeated-card source-entry'}),top=element('div',{class:'repeated-top'});
    top.append(element('strong',{'data-zh':'证据来源','data-en':'Evidence source'},tr('证据来源','Evidence source')));
    const remove=element('button',{type:'button',class:'remove-entry','data-zh':'移除','data-en':'Remove'},tr('移除','Remove'));
    remove.onclick=()=>card.remove();top.append(remove);card.append(top);
    const kind=element('select',{class:'source-kind'});
    [['official','官方','Official'],['third_party','第三方','Third party'],['archived','网页存档','Web archive'],['other','其他可追溯来源','Other traceable source']].forEach(([v,zh,en])=>kind.append(element('option',{value:v,'data-zh':zh,'data-en':en},tr(zh,en))));
    kind.value=saved.kind||'official';
    const url=element('input',{class:'source-url',type:'url',placeholder:'https://',maxlength:'2000',required:''});url.value=saved.url||'';
    const supported=element('input',{class:'source-fields',maxlength:'400',required:''});supported.value=saved.fields||'';
    const quote=element('textarea',{class:'source-quote',rows:'4',maxlength:'12000',required:''});quote.value=saved.quote||'';
    const locator=element('input',{class:'source-locator',maxlength:'500'});locator.value=saved.locator||'';
    // Native date controls use the browser/OS locale, even when the page is English.
    const date=element('input',{class:'source-date',type:'text',placeholder:'YYYY-MM-DD',maxlength:'10',pattern:'[0-9]{4}-[0-9]{2}-[0-9]{2}',autocomplete:'off'});date.value=saved.date||'';
    card.append(label('来源链接 *','Source URL *',url),label('来源类别','Publisher type',kind),label('支持哪些字段 *','Fields supported *',supported),label('来源原句 *（保留原语言）','Exact source quotation * (original language)',quote));
    const grid=element('div',{class:'field-grid'});grid.append(label('页码、章节或表格位置','Page, section or table',locator),label('实际访问／截图日期（如已知）','Actual access / capture date (if known)',date));card.append(grid);$('#sources').append(card);
  }
  function setDevice() {
    const add=$('#request-type').value==='add';
    $('#existing-device-label').hidden=add;
    $('#device-name').readOnly=!add;$('#manufacturer').readOnly=!add;
    const d=add?null:currentDevice();
    $('#device-name').value=d?.row.name||'';$('#manufacturer').value=d?.row.manufacturer||'';
    document.querySelectorAll('.change-field').forEach(s=>s.dispatchEvent(new Event('change')));
  }
  function draft() {
    return {
      type:$('#request-type').value, deviceId:$('#request-type').value==='add'?'':$('#existing-device').value,
      name:$('#device-name').value, manufacturer:$('#manufacturer').value,configuration:$('#configuration').value,
      release:HMD_DATA.summary.as_of||HMD_DATA.summary.formal_as_of||'2026-10-13',
      reason:$('#reason').value,confirmed:$('#confirmation').checked,
      changes:[...document.querySelectorAll('.change-entry')].map(c=>({field:c.querySelector('.change-field').value,current:c.querySelector('.change-current').value,proposed:c.querySelector('.change-proposed').value,scope:c.querySelector('.change-scope').value})),
      evidence:[...document.querySelectorAll('.source-entry')].map(c=>({url:c.querySelector('.source-url').value,kind:c.querySelector('.source-kind').value,fields:c.querySelector('.source-fields').value,quote:c.querySelector('.source-quote').value,locator:c.querySelector('.source-locator').value,date:c.querySelector('.source-date').value}))
    };
  }
  function preview() {
    issue=HMDSubmission.markdown(draft(),language);
    $('#markdown-preview').textContent=issue.title+'\n\n'+issue.body;
    if(!$('#long-issue').hidden) $('#long-issue-link').href=HMDSubmission.githubLink(HMD_SITE_CONFIG,issue).url;
    return issue;
  }
  function report(message) {errorMessage=message;$('#errors').textContent=message();$('#errors').hidden=false;$('#errors').scrollIntoView({block:'center',behavior:'smooth'});}
  allDevices.sort((a,b)=>a.row.name.localeCompare(b.row.name)).forEach(d=>$('#existing-device').append(element('option',{value:d.row.device_id},`${d.row.name} · ID ${d.row.device_id}`)));
  const params=new URLSearchParams(location.search);
  $('#request-type').value=Object.hasOwn(HMDSubmission.types,params.get('type'))?params.get('type'):'add';
  if(params.has('device')){$('#existing-device').value=params.get('device');if(!params.has('type'))$('#request-type').value='correct';}
  addChange({field:params.get('field')||'mass'});addSource();setDevice();translate();
  $('#request-type').onchange=setDevice;$('#existing-device').onchange=setDevice;
  $('#add-change').onclick=()=>addChange();$('#add-source').onclick=()=>addSource();
  $('#form-language').onchange=()=>{language=$('#form-language').value;try{localStorage.setItem('hmd-language',language);}catch{}translate();};
  $('#preview-button').onclick=()=>{preview();$('#preview-details').open=true;};
  $('#copy-markdown').onclick=async()=>{try{await navigator.clipboard.writeText(preview().body);draftStatus=()=>tr('已复制完整 Issue 内容。','Full issue body copied.');$('#draft-status').textContent=draftStatus();}catch{report(()=>tr('无法自动复制，请在预览区选择文本复制，或下载 Markdown。','Clipboard unavailable. Select the preview text or download Markdown.'));}};
  $('#download-markdown').onclick=()=>{const data=preview();const url=URL.createObjectURL(new Blob([data.title+'\n\n'+data.body],{type:'text/markdown;charset=utf-8'}));const a=element('a',{href:url,download:'hmd-device-contribution.md'});a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);};
  $('#contribution-form').onsubmit=async event=>{
    event.preventDefault();errorMessage=null;$('#errors').hidden=true;$('#long-issue').hidden=true;
    const data=draft(), errors=HMDSubmission.validate(data);
    const names={type:['提交类型','request type'],name:['设备名称','device name'],manufacturer:['制造商','manufacturer'],device:['现有设备','existing device'],changes:['至少一个完整字段（拟修改值、单位与口径）','at least one complete field (proposed value, units and scope)'],evidence:['至少一个完整来源（HTTP(S) 链接、原句、支持字段）','at least one complete source (HTTP(S) URL, quotation and supported fields)'],date:['有效的访问／截图日期（YYYY-MM-DD），未知可留空','a valid access / capture date in YYYY-MM-DD format, or leave it blank if unknown'],reason:['修改理由','reason'],confirmed:['确认待审核说明','review acknowledgement']};
    if(errors.length){report(()=>tr('请补齐：\n','Please complete:\n')+errors.map(k=>'• '+tr(...names[k])).join('\n'));return;}
    const result=preview();
    $('#submit-button').disabled=true;
    try{
        const target=HMDSubmission.githubLink(HMD_SITE_CONFIG,result);
        if(target.needsPaste){$('#preview-details').open=true;$('#long-issue').hidden=false;$('#long-issue-link').href=target.url;}
        else location.href=target.url;
    }catch(error){report(()=>tr('未能打开提交页面：','Could not open the submission page: ')+error.message);}
    finally{$('#submit-button').disabled=false;}
  };
})();
