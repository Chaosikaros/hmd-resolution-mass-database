'use strict';
const $=s=>document.querySelector(s), esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const projectText=HMDI18n.projectText;
const isTrue=v=>v===true||String(v).toLowerCase()==='true';
const yearEvents=HMDI18n.dictionary({release:'实际发售／供货',announcement:'公告',crowdfunding:'众筹',planned_availability:'预计供货',public_demonstration:'公开展示',planned_demonstration:'计划展示',preview:'提前上手',prototype:'原型',concept:'概念'});
const labels=HMDI18n.dictionary({category:'设备分类',year:'年份',announcement_year:'公告年份',mass:'头戴质量',mass_bare:'官方裸机质量（仅头显）',display:'显示类型',ppd:'PPD',third_party_ppd_reference:'第三方 PPD（仅供参考）',ppd_reported:'厂商报告 PPD（口径未说明）',raster:'每眼像素',fov:'视场角 FOV',fov_nominal:'补充 FOV 规格',optics:'光学结构'});
Object.assign(labels,{ppd_calibration_region:'中心区域分辨率与 FOV',manufacturer_reported_ppd:'厂商报告 PPD（口径未说明）',mass_component_exclusions:'质量组成与排除项',configuration:'型号与配置',family:'设备系列',family_id:'设备系列标识'});
const fieldOrder=['category','year','announcement_year','mass','mass_bare','mass_component_exclusions','display','raster','fov','fov_nominal','optics','ppd_reported','manufacturer_reported_ppd','ppd','ppd_calibration_region','third_party_ppd_reference','configuration','family','family_id'];
const kindLabel=HMDI18n.dictionary({official:'官方值',algorithm_estimate:'算法估算值'});
const modelKinds=['algorithm_estimate'];
function matchesPPD(r,kind){return !kind||(kind==='missing'?r.ppd_working==null:r.ppd_working_kind===kind);}
let db,mainDB,selected,activeCapture,activeCaptureField,imageMode='highlighted',zoom=1,sortKey='device_id',ascending=true,focusField='ppd';
const imageURL=p=>p.split('/').map(encodeURIComponent).join('/');
const safeURL=u=>/^https?:\/\//i.test(u)?u:'#';
const number=(n,d=1)=>n===''||n==null||!Number.isFinite(Number(n))?'—':Number(n).toLocaleString(HMDI18n.language==='en'?'en-US':'zh-CN',{maximumFractionDigits:d,useGrouping:false});
function ppdDisplay(r){return number(r.ppd_working,2);}
function hasPPDInterval(r){return r.ppd_working_kind==='algorithm_estimate'&&[r.ppd_estimate_low,r.ppd_estimate_high].every(v=>v!==''&&v!=null&&Number.isFinite(Number(v)));}
function ppdLabel(r){return r.ppd_working==null?t('缺失'):kindLabel[r.ppd_working_kind]||t('缺失');}
function nodeText(value){let width=0,text='';for(const c of String(value)){width+=c.charCodeAt(0)>255?2:1;if(width>20)return text+'…';text+=c;}return text;}
function sourceCategory(k){const found=db.summary.categories.find(c=>c.category===k);if(found)return {...found,label:HMDI18n.source(k,found.label)};return {category:k,label:HMDI18n.source(k,k),color:'#78828f'};}
function tags(d){return [...new Set(d.fields.flatMap(f=>f.sources.map(s=>s.category)))];}
function badge(k){const c=sourceCategory(k);return ui`<span class="badge" style="color:${c.color};border-color:${c.color}55;background:${c.color}0a">${esc(HMDI18n.source(c.category,c.label))}</span>`;}
function renderChart(){
 const key=$('#metric').value, cats=db.summary.categories,total=cats.reduce((n,c)=>n+c[key],0);let n=0;
 const gradient=cats.map(c=>{const start=n/(total||1)*100;n+=c[key];return ui`${c.color} ${start}% ${n/(total||1)*100}%`;}).join(',');
 $('#donut').innerHTML=ui`<div class="donut" style="background:${total?ui`conic-gradient(${gradient})`:"#edf1f5"}"><div class="donut-label"><strong>${total}</strong><span>${key==='device_coverage'?t('跨类覆盖计次'):key==='unique_pages'?t('页面分类计次'):t('字段关联')}</span></div></div>`;
 const max=Math.max(1,...cats.map(c=>c[key]));
 $('#bars').innerHTML=cats.map(c=>ui`<div class="bar-row"><button class="bar-label" data-kind="${c.category}" title="筛选采用此类来源的设备"><i class="dot" style="background:${c.color}"></i>${esc(HMDI18n.source(c.category,c.label))}</button><div class="track"><div class="fill" style="width:${c[key]/(max||1)*100}%;background:${c.color}"></div></div><div class="bar-number">${c[key]} <small>${(c[key]/(total||1)*100).toFixed(1)}%</small></div></div>`).join('');
 $('#chart-note').textContent=key==='device_coverage'?t('同一设备可出现在多类中，比例表示覆盖计次构成。'):key==='unique_pages'?t('每类内部按 URL 去重；同一页面可跨类别重复计数，全局唯一页面数见上方。不代表独立测量数量。'):t('一个字段可以关联多个来源，包括设备参数、分类依据和明确标记的模型输入引用。');
}
function renderTable(){
 renderSortState();
 const q=$('#search').value.toLowerCase().trim(), cat=$('#category').value, kind=$('#source-kind').value, ppd=$('#ppd-kind').value;
 const list=db.devices.filter(d=>(!cat||d.row.category===cat)&&matchesPPD(d.row,ppd)&&(!kind||tags(d).includes(kind))&&(!q||[d.row.name,d.row.manufacturer,d.row.device_id,...(d.row.aliases||[]),...(d.row.merged_device_ids||[]),...d.fields.flatMap(f=>[f.quote,...f.sources.map(s=>s.url)])].join(' ').toLowerCase().includes(q)));
 list.sort((a,b)=>{const av=a.row[sortKey],bv=b.row[sortKey];if(av==null||av==='')return bv==null||bv===''?0:1;if(bv==null||bv==='')return -1;return (sortKey==='name'?av.localeCompare(bv):Number(av)-Number(bv))*(ascending?1:-1);});
 $('#result-count').textContent=ui`${list.length} / ${db.devices.length}`;
 $('#devices').innerHTML=list.length?list.map(d=>{const r=d.row,urls=new Set(d.fields.flatMap(f=>f.sources.map(s=>s.url))),captures=new Set(d.fields.flatMap(f=>f.captures.map(c=>c.raw||c.highlighted)));
 return ui`<tr><td><button class="device-name" data-device="${r.device_id}">${esc(r.name)}</button><div class="device-meta">${parameterButton(d,'category',HMDI18n.category(r.category))}<span aria-hidden="true">·</span>${parameterButton(d,'year',number(r.year,0))}</div><small>ID ${r.device_id} · ${esc(r.manufacturer)}${r.year_event_basis&&r.year_event_basis!=='release'?ui` · ${esc(yearEvents[r.year_event_basis]||r.year_event_basis)}`:''}</small>${(r.aliases?.length||r.merged_device_ids?.length)?ui`<details class="row-extra"><summary>别名与合并记录</summary>${aliasMarkup(r)}</details>`:''}${r.gap_note?ui`<details class="row-extra gap-note"><summary>${r.completeness?.status==='complete'?t('参数说明'):t('参数缺口')}</summary><small>${esc(projectText(r.gap_note))}</small></details>`:''}</td><td class="num primary-value">${parameterButton(d,'mass',massDisplay(r))}<small>${esc(massLabel(r))}</small></td><td class="num primary-value">${parameterButton(d,'ppd',ppdDisplay(r))}<small class="ppd-provenance ppd-${r.ppd_working_kind||'missing'}">${ppdLabel(r)}</small>${hasPPDInterval(r)?ui`<small>${t('区间 ')}${number(r.ppd_estimate_low,2)}–${number(r.ppd_estimate_high,2)}</small>`:ui`<small>${esc(ppdScope(r))}</small>`}</td><td class="num">${rasterCell(d)}</td><td class="num">${fovCell(d)}</td><td>${parameterButton(d,'optics',opticsValue(d))}${isTrue(r.multi_resolution)?t('<small>多分辨率显示</small>'):''}</td><td><button class="open-device" data-device="${r.device_id}">查看证据 →</button><small>${urls.size} ${HMDI18n.language==='en'&&urls.size===1?'source':t('来源')} · ${captures.size} ${HMDI18n.language==='en'&&captures.size===1?'capture':t('张截图')}</small><a class="row-contribute" href="contribute.html?type=correct&device=${encodeURIComponent(r.device_id)}">${t('提出修改 ↗')}</a></td></tr>`;
 }).join(''):ui`<tr><td colspan="7" class="empty">${db.devices.length?t('没有匹配的设备，请调整筛选。'):t('此范围内暂无设备记录。')}</td></tr>`;
}
const axisLabel=(k,value)=>value==null?'—':({horizontal:t('横向'),vertical:t('纵向'),diagonal:t('对角线')})[k]||t('横向（默认）');
const opticsLabels=HMDI18n.dictionary({fresnel:'菲涅尔',pancake:'折叠光学（Pancake）',aspheric:'非球面',birdbath:'鸟浴式（Birdbath）',waveguide:'光波导',freeform:'自由曲面',freeform_prism:'自由曲面棱镜',prism:'棱镜',non_fresnel:'非菲涅尔',hybrid_fresnel:'混合菲涅尔',hybrid_fresnel_aspheric:'菲涅尔／非球面混合',semi_reflective_combiner:'半反射合光器',freeform_lightguide_relay:'自由曲面导光中继',free_space_combiner:'自由空间合光器',adjustable_lens_eyepieces:'可调透镜目镜',off_axis_half_silvered_mirror:'离轴半反射镜',beam_steering_lenses:'光束转向透镜',dual_lens_refractive:'双透镜折射系统',semi_transparent_mirror_beam_combiner:'半透镜合光器',curved_mirrors:'曲面反射镜',projector_reflector:'投影器／反射器'});
Object.assign(opticsLabels,{lens_projection:'镜片投影',lens_optics:'透镜光学',eyepiece_optics:'目镜光学',catadioptric:'折反射光学',four_element_optical_lens_assembly:'四片透镜组件',mirror_and_lens_projector:'反射镜／透镜投影系统','proprietary Vrgineers VR lenses':'Vrgineers 专有 VR 镜片'});
function opticsValue(d){const v=d.row.physical_optics;return v?(opticsLabels[v]||v):'—';}
function massDisplay(r){if(r.mass_point_g==null)return '—';const k=r.mass_value_kind||'';return (k.includes('upper_bound')?(r.mass_bound_inclusive===false?'< ':r.mass_bound_inclusive===true?'≤ ':t('上限 ')):k.includes('lower_bound')?(r.mass_bound_inclusive===false?'> ':r.mass_bound_inclusive===true?'≥ ':t('下限 ')):/estimate|approximate/.test(k)?t('约 '):'')+number(r.mass_point_g)+' g';}
function massLabel(r){if(r.mass_point_g==null)return '';const scope=r.mass_assembly_scope==='partial_assembly'?t('组件质量；整机缺失'):t('整机');const kind=({measurement:t('实测'),estimate:t('来源估计'),component_sum:t('部件合计'),range_midpoint:t('来源范围中点'),range_endpoint:t('来源范围端点')})[r.mass_value_kind];return scope+(kind?' · '+kind:'');}
function ppdScope(r){return ({central:t('中心'),peak:t('峰值'),average:t('平均'),focus_region:t('焦点显示区')})[r.ppd_scope_class]||'';}
function parameterButton(d,key,value){return ui`<button class="parameter-link" data-device="${d.row.device_id}" data-initial-field="${key}">${esc(value)}</button>`;}
function regionFOV(g){return number(g.fov_default_deg)+'°'+(g.fov_vertical_deg==null?' · '+t('横向'):' × '+number(g.fov_vertical_deg)+'°');}
function fieldLabel(key,r=selected?.row){if(key==='raster'&&r?.ppd_calibration_region)return t('外围屏每眼像素');if(key==='fov'&&r?.ppd_calibration_region)return t('整机视场角 FOV');return labels[key]||key;}
function rasterCell(d){const r=d.row,g=r.ppd_calibration_region;const base=parameterButton(d,'raster',number(r.w_px,0)+' × '+number(r.h_px,0));return (g?parameterButton(d,'ppd_calibration_region',number(g.w_px,0)+' × '+number(g.h_px,0))+ui`<small>中心区域 · 每眼 px</small><small>外围屏：${base} px</small>`:base+ui`<small>${(isTrue(r.monocular)?t('单目'):t('每眼'))+' · '+(r.raster_axis_confirmed===false?t('来源排列'):t('宽 × 高'))+' px'}</small>`)+(r.display?ui`<small>${d.fields.some(f=>f.key==='display')?parameterButton(d,'display',projectText(r.display)):esc(projectText(r.display))}</small>`:'');}
function fovCell(d){const r=d.row,g=r.ppd_calibration_region,base=parameterButton(d,'fov',r.fov_default_deg==null?'—':number(r.fov_default_deg)+'°');return g?parameterButton(d,'ppd_calibration_region',regionFOV(g))+ui`<small>中心区域</small><small>整机：${base} · ${esc(axisLabel(r.fov_axis,r.fov_default_deg))}</small>`:base+ui`<small>${esc(axisLabel(r.fov_axis,r.fov_default_deg))}</small>`;}
function fieldValue(f){if(f.key==='ppd_calibration_region')return `${number(f.value.w_px,0)} × ${number(f.value.h_px,0)} px / ${regionFOV(f.value)}`; if(['year','announcement_year'].includes(f.key))return String(f.value??'—')+(HMDI18n.language==='zh'&&f.value!=null?' 年':'');if(f.key==='category')return HMDI18n.category(f.value);if(f.key==='optics')return opticsValue(selected);if(f.key==='mass')return massDisplay(selected.row);if(f.key==='raster')return ui`${number(selected.row.w_px,0)} × ${number(selected.row.h_px,0)}`;if(f.key==='ppd')return ppdDisplay(selected.row);if(f.value&&typeof f.value==='object')return Object.entries(f.value).map(([k,v])=>ui`${({physical_optics:t('实际光学'),project_model_group:t('模型分组')})[k]||k}: ${projectText(v)}`).join('; ');return ui`${projectText(f.value??'—')} ${projectText(f.unit||'')}`;}
function tree(){
 let y=40;const positions={},blocks=[];
 for(const f of [...selected.fields].sort((a,b)=>fieldOrder.indexOf(a.key)-fieldOrder.indexOf(b.key))){const height=Math.max(74,f.sources.length*48);positions[f.key]=y+height/2;blocks.push({f,y,height});y+=height+8;}
 const rootY=y/2,model=modelKinds.includes(selected.row.ppd_working_kind);
 let svg=ui`<svg viewBox="0 0 710 ${y+30}" width="710" height="${y+30}" role="img" aria-label="${esc(selected.row.name)}字段到来源的证据树"><g fill="none" stroke="#cbd7e4" stroke-width="1.5">`;
 for(const b of blocks){const fy=positions[b.f.key];svg+=ui`<path d="M140 ${rootY} C165 ${rootY},160 ${fy},188 ${fy}"/>`;for(let i=0;i<b.f.sources.length;i++){const sy=b.y+22+i*48;svg+=ui`<path d="M338 ${fy} C359 ${fy},359 ${sy},384 ${sy}"/>`;}}
 if(model){for(const k of ['raster','fov','optics'])svg+=ui`<path stroke="#8795a5" stroke-dasharray="4 4" d="M264 ${positions.ppd+23} L350 ${positions.ppd+23} L350 ${positions[k]} L338 ${positions[k]}"/>`;}
 svg+='</g><g><rect x="12" y="'+(rootY-30)+'" width="128" height="60" rx="10" fill="#182a3d"/><text x="76" y="'+(rootY-5)+'" text-anchor="middle" fill="white">ID '+selected.row.device_id+'</text><text x="76" y="'+(rootY+15)+t('" text-anchor="middle" fill="#bed0e3">设备当前记录</text></g>');
 for(const b of blocks){const f=b.f,fy=positions[f.key],derived=f.key==='ppd'&&model;
 svg+=ui`<g class="node" data-field="${f.key}" tabindex="0" role="button" aria-label="查看${fieldLabel(f.key)}证据"><title>${esc(fieldValue(f))}</title><rect x="188" y="${fy-24}" width="150" height="48" rx="8" fill="${derived?'#e9edf2':'#fff'}" stroke="${focusField===f.key?'#2563eb':'#b9c9da'}"/><text x="200" y="${fy-4}" fill="#182a3d">${esc(nodeText(fieldLabel(f.key)))}${derived?t(' · 计算'):''}</text><text x="200" y="${fy+14}" fill="#64748b">${esc(nodeText(fieldValue(f)))}</text></g>`;
 f.sources.forEach((s,i)=>{const sy=b.y+22+i*48,color=s.color||sourceCategory(s.category).color;let host;try{host=new URL(s.url).hostname;}catch{host=s.url;}
 svg+=ui`<a href="${esc(safeURL(s.url))}" target="_blank" rel="noopener noreferrer" class="node"><title>${esc(HMDI18n.source(s.category,s.label)+' · '+s.url)}</title><rect x="384" y="${sy-19}" width="248" height="38" rx="7" fill="${color}0e" stroke="${color}"/><circle cx="397" cy="${sy}" r="4" fill="${color}"/><text x="410" y="${sy+4}" fill="#182a3d">${esc(host).slice(0,29)} ↗</text></a>`;
 const ci=f.captures.findIndex(c=>c.url===s.url||c.evidence_source_url===s.url);if(ci>=0)svg+=ui`<g class="node" tabindex="0" role="button" aria-label="查看${fieldLabel(f.key)}来源截图" data-capture="${f.key}:${ci}"><title>查看此来源的实际截图</title><rect x="645" y="${sy-17}" width="52" height="34" rx="6" fill="white" stroke="#c2cfde"/><text x="671" y="${sy+4}" text-anchor="middle">截图</text></g>`;
 });}
 $('#tree').innerHTML=svg+'</svg>';
 const r=selected.row;$('#model-note').innerHTML=model?ui`<strong>算法估算值 · ${r.ppd_derivation?.method==='geometric_proxy'?t('几何计算'):r.ppd_derivation?.method==='sarc'?t('SARC 结构与轴向校准'):t('光学组校准')}</strong><p>${esc(HMDI18n.modelText(r.ppd_calculation))}</p>${hasPPDInterval(r)?ui`<p>估算区间：${number(r.ppd_estimate_low,2)}–${number(r.ppd_estimate_high,2)}</p>`:''}<p>${esc((r.ppd_derivation?.limitations||[]).map(HMDI18n.modelText).join(' '))}</p>`:ui`<strong>${ppdLabel(r)}</strong><p>${esc(ppdScope(r))}</p>`;
}
const captureLabel=c=>({context_image:t('外观／页面上下文'),input_evidence:t('计算输入依据'),adopted_field_support:t('采用参数依据')})[c.role]||t('参数证据');
function evidence(key){focusField=key;const f=selected.fields.find(x=>x.key===key);tree();
 $('#detail-contribute').innerHTML=ui`<a class="secondary-action" href="contribute.html?type=correct&device=${encodeURIComponent(selected.row.device_id)}&field=${encodeURIComponent(key)}">${t('提出修改 ↗')}</a><a class="secondary-action" href="contribute.html?type=evidence&device=${encodeURIComponent(selected.row.device_id)}&field=${encodeURIComponent(key)}">${t('补充证据 ↗')}</a>`;
 $('#evidence').innerHTML=ui`<h3>${fieldLabel(key)} · ${esc(fieldValue(f))}</h3><div class="evidence-card"><div>${f.sources.map(s=>badge(s.category)).filter((x,i,a)=>a.indexOf(x)===i).join('')}</div><p><strong>证据评分 ${esc(f.score)} / 5</strong> <span class="muted">支持强度，不是正确概率</span></p>${f.quote?ui`<div class="original-label">${t('来源原文（保留原语言）')}</div><blockquote lang="und">${esc(f.quote)}</blockquote>`:ui`<blockquote>${esc(f.key==='ppd'&&modelKinds.includes(selected.row.ppd_working_kind)?t('这是项目推导值，外部来源没有直接报告该PPD；请查看计算与输入依据。'):projectText(f.reason)||t('尚无可采用的对应参数依据。'))}</blockquote>`}<p class="original-label">${t("采用依据")}</p><p class="reason">${esc(projectText(f.reason))}</p><p class="reason muted">${esc(projectText(f.scope))}</p>${f.sources.map(s=>ui`<a class="source-link" href="${esc(safeURL(s.url))}" target="_blank" rel="noopener noreferrer">${esc(s.url)} ↗</a>`).join('')}<h4>来源截图 <span class="muted">点击放大</span></h4><div class="thumbs">${f.captures.map((c,i)=>ui`<button class="thumb" data-capture="${key}:${i}"><img loading="lazy" src="${imageURL(c.highlighted||c.raw)}" alt="${fieldLabel(key)}${captureLabel(c)} ${i+1}"><span>${esc(captureLabel(c))} · ${esc(projectText(c.caption)||new URL(c.url).hostname)} · ${i+1}</span></button>`).join('')}</div><p class="footnote">截图分别关联来源页面，可切换未高亮图。展示图经过压缩，保留原分辨率；原始文件指纹与来源关联见 <a href="evidence_asset_manifest.json" target="_blank">截图追溯清单</a>${HMDI18n.language==='en'?'.':'。'}</p></div>`;
}
function aliasMarkup(row){return row.aliases?.length?`<small class="device-aliases">${esc(t('别名'))}: ${row.aliases.map(esc).join(' · ')}</small>`:'';}
function matchesDeviceID(d,id){return String(d.row.device_id)===String(id)||(d.row.merged_device_ids||[]).some(old=>String(old)===String(id));}
function openDevice(id,initialField='raster'){selected=db.devices.find(d=>matchesDeviceID(d,id));if(!selected)return false;id=selected.row.device_id;if(!selected.fields.some(f=>f.key===initialField))initialField='raster';focusField=initialField;
 $('#device-id').textContent=ui`${HMDI18n.language==='zh'?'设备':'DEVICE'} ${String(id).padStart(3,'0')} / ${HMDI18n.category(selected.row.category)}`;$('#device-title').textContent=selected.row.name;
 const r=selected.row;$('#device-facts').innerHTML=aliasMarkup(r)+ui`<div class="facts">${r.image_local_path?ui`<img id="device-photo" src="${imageURL(r.image_local_path)}" alt="${esc(r.name)}设备页面图">`:''}<div><small>${esc(projectText(r.image_caption)||t('设备来源页图，仅用于设备外观说明'))}</small><br><strong>${number(r.year,0)} · ${esc(massDisplay(r))}</strong><p class="muted">${ppdLabel(r)} · ${esc(projectText(r.mass_scope))}</p><small>${esc(r.review_completed_at||r.browser_reviewed_at||r.formal_as_of||'')}${db===mainDB&&isTrue(r.calibration_reference_eligible)?t(' · 校准参考'):''}</small></div></div>`;
 $('#device-facts').insertAdjacentHTML('beforeend','<div id="detail-contribute" class="detail-contribute"></div>');
 if(r.category_evidence_quote&&!selected.fields.some(f=>f.key==='category')) $('#device-facts').insertAdjacentHTML('beforeend',ui`<div class="evidence-card"><strong>类别依据 · ${esc(HMDI18n.category(r.category))} · ${esc(r.category_evidence_score)}/5</strong><div class="original-label">${t("来源原文（保留原语言）")}</div><blockquote lang="und">${esc(r.category_evidence_quote)}</blockquote><p>${esc(projectText(r.category_evidence_reason))}</p>${r.category_evidence_source_url.split(' | ').map(u=>ui`<a class="source-link" href="${esc(safeURL(u))}" target="_blank" rel="noopener noreferrer">${esc(u)} ↗</a>`).join('')}</div>`);
 $('#device-facts').insertAdjacentHTML('beforeend',ui`<div class="parameter-facts">${fieldOrder.filter(k=>selected.fields.some(f=>f.key===k)).map(k=>{const f=selected.fields.find(f=>f.key===k);const val=k==='fov'?number(r.fov_default_deg)+'° · '+axisLabel(r.fov_axis,r.fov_default_deg):k==='optics'?opticsValue(selected):fieldValue(f);return ui`<button data-field="${k}"><small>${fieldLabel(k)}</small><strong>${esc(val)}</strong>${k==='ppd'?ui`<small>${ppdLabel(r)}</small>`:''}</button>`;}).join('')}</div>`);evidence(initialField);if(!$('#detail').open)$('#detail').showModal();history.replaceState(null,'',ui`#device-${id}`);
}
function openImage(key,index){const f=selected.fields.find(x=>x.key===key);activeCapture=f.captures[index];activeCaptureField=key;imageMode=activeCapture.highlighted?'highlighted':'raw';$('#image-title').textContent=ui`${selected.row.name} · ${fieldLabel(key)} · ${captureLabel(activeCapture)}`;showImage();$('#viewer').showModal();}
function showImage(){
 const c=activeCapture,devicePhoto=c.role==='device_image';
 $('#full-image').onload=fitImage;$('#full-image').src=imageURL(c[imageMode]||c.raw||c.highlighted);
 $('#full-image').alt=devicePhoto?selected.row.name+' · '+t('设备页面图'):t('浏览器来源截图');
 $('#image-toggle').hidden=!(c.raw&&c.highlighted&&c.raw!==c.highlighted);
 $('#image-toggle').textContent=imageMode==='highlighted'?t('切换未高亮图'):t('切换高亮');
 $('#image-source').href=safeURL(c.url);$('#image-source').hidden=!c.url;
 const metadata=[projectText(c.caption)];
 if(!devicePhoto)metadata.push(t('证据时间：')+(c.captured_at||t('未记录')),projectText(c.time_basis));
 $('#image-time').textContent=metadata.filter(Boolean).join(' · ');
}
function scaleImage(){const im=$('#full-image');im.style.width=Math.round(im.naturalWidth*zoom)+'px';im.style.height='auto';}
function fitImage(){zoom=Math.min(1,($('#image-stage').clientWidth-40)/$('#full-image').naturalWidth);scaleImage();}
document.addEventListener('click',ev=>{const dev=ev.target.closest('[data-device]');if(dev)return openDevice(dev.dataset.device,dev.dataset.initialField);const field=ev.target.closest('[data-field]');if(field)return evidence(field.dataset.field);const cap=ev.target.closest('[data-capture]');if(cap){const [k,i]=cap.dataset.capture.split(':');return openImage(k,Number(i));}const kind=ev.target.closest('[data-kind]');if(kind){$('#source-kind').value=kind.dataset.kind;renderTable();$('.filters').scrollIntoView({behavior:'smooth',block:'center'});}const sort=ev.target.closest('[data-sort]');if(sort){ascending=sortKey===sort.dataset.sort?!ascending:true;sortKey=sort.dataset.sort;renderTable();}});
document.addEventListener('keydown',ev=>{if((ev.key==='Enter'||ev.key===' ')&&ev.target.matches('g[role="button"]')){ev.preventDefault();ev.target.dispatchEvent(new MouseEvent('click',{bubbles:true}));}});
$('#search').addEventListener('input',renderTable);['category','source-kind','ppd-kind'].forEach(id=>$('#'+id).addEventListener('change',renderTable));$('#metric').addEventListener('change',renderChart);
$('#reset').onclick=()=>{['search','category','source-kind','ppd-kind'].forEach(id=>$('#'+id).value='');renderTable();};
$('#close-detail').onclick=()=>$('#detail').close();$('#detail').addEventListener('close',()=>history.replaceState(null,'','#'));$('#close-viewer').onclick=()=>$('#viewer').close();
$('#image-toggle').onclick=()=>{imageMode=imageMode==='highlighted'?'raw':'highlighted';showImage();};$('#zoom-in').onclick=()=>{zoom=Math.min(8,zoom*1.3);scaleImage();};$('#zoom-out').onclick=()=>{zoom=Math.max(.1,zoom/1.3);scaleImage();};$('#fit').onclick=fitImage;$('#actual').onclick=()=>{zoom=1;scaleImage();};
$('#device-facts').addEventListener('click',ev=>{if(ev.target.id==='device-photo'){activeCapture={role:'device_image',raw:selected.row.image_local_path,url:selected.row.image_source_page,caption:selected.row.image_caption||'设备来源页图，仅用于外观说明'};imageMode='raw';$('#image-title').textContent=selected.row.name+' · '+t('设备页面图');showImage();$('#viewer').showModal();}});
function switchDataset(key,preserve=false){
 const saved=preserve?Object.fromEntries(['search','category','source-kind','ppd-kind'].map(id=>[id,$('#'+id).value])):null;
 db=key==='main'?mainDB:window.HMD_AUXILIARY[key];
 ['search','category','source-kind','ppd-kind'].forEach(id=>$('#'+id).value='');
 $('#category').innerHTML=t('<option value="">全部设备类别</option>')+['一体机','PC VR','AR'].map(c=>ui`<option value="${esc(c)}">${esc(HMDI18n.category(c))}</option>`).join('');
 $('#source-kind').innerHTML=t('<option value="">全部来源类别</option>')+db.summary.categories.map(c=>ui`<option value="${c.category}">${esc(HMDI18n.source(c.category,c.label))}</option>`).join('');
 $('#dataset-note').textContent=key==='main'?t('2016年至今的完整参数主集；重量界限保留原始不等式；PPD 采用官方值或项目算法估算值。'):t(db.note);
 const counts=['official','algorithm_estimate'].map(k=>[db.devices.filter(d=>d.row.ppd_working_kind===k).length,'PPD · '+kindLabel[k]]);
 const missingPPD=db.devices.filter(d=>d.row.ppd_working==null).length;
 $('#metrics').innerHTML=[[db.devices.length,t('本数据集设备')],[db.summary.unique_pages,t('采用来源页面')],...counts,[missingPPD,t('PPD缺失')]].map(([n,l])=>ui`<div class="metric"><strong>${n}</strong><span>${l}</span></div>`).join('');
 if(saved)Object.entries(saved).forEach(([id,value])=>$('#'+id).value=value);
 renderChart();renderTable();
}
$('#dataset-view').addEventListener('change',()=>switchDataset($('#dataset-view').value));
$('#refresh-data').addEventListener('click',()=>location.reload());
function latestFieldReview(datasets){
 const dates=[];
 const add=value=>{if(typeof value==='string'&&/^\d{4}-\d{2}-\d{2}(?:T|$)/.test(value))dates.push(value.slice(0,10));};
 const visit=review=>{if(!review||typeof review!=='object')return;for(const [key,value] of Object.entries(review)){if(/^(as_of|reviewed_at|reviewed_at_utc|completed_at|completed_at_utc)$/.test(key))add(value);else if(value&&typeof value==='object')visit(value);}};
 for(const dataset of datasets)for(const device of dataset.devices){add(device.row.formal_as_of);add(device.row.browser_reviewed_at);add(device.row.review_completed_at);visit(device.review);}
 return dates.sort().at(-1)||t('未记录');
}
const releaseDate=latestFieldReview([window.HMD_DATA,window.HMD_AUXILIARY.missing,window.HMD_AUXILIARY.historical]);
function renderReleaseSummary(){$('#release-summary').textContent=ui`当前发布：主集 ${window.HMD_DATA.devices.length} 台 · 缺数据辅助集 ${window.HMD_AUXILIARY.missing.devices.length} 台 · 历史档案 ${window.HMD_AUXILIARY.historical.devices.length} 台 · 最近字段复核 ${releaseDate}`;
}
renderReleaseSummary();
const initialDeviceHash=location.hash;
function openDeviceFromHash(hash=location.hash){const match=/^#device-(\d+)$/.exec(hash||'');if(!match)return;const datasets={main:mainDB,missing:window.HMD_AUXILIARY.missing,historical:window.HMD_AUXILIARY.historical};for(const [key,dataset] of Object.entries(datasets)){if(dataset?.devices.some(d=>matchesDeviceID(d,match[1]))){$('#dataset-view').value=key;switchDataset(key,true);openDevice(match[1]);return;}}}
window.addEventListener('hashchange',()=>openDeviceFromHash());
Promise.resolve(window.HMD_DATA).then(data=>{mainDB=data;$('#data-updated').textContent=releaseDate;$('#formal-total').textContent=data.devices.length;switchDataset('main');renderCoverageProgress();openDeviceFromHash(initialDeviceHash);}).catch(e=>{$('#devices').innerHTML=ui`<tr><td colspan="7">数据加载失败：${esc(e.message)}。</td></tr>`;});
function renderCoverageProgress(){const a=window.HMD_AUXILIARY;$('#coverage-progress').textContent=HMDI18n.language==='en'?`Current publication: ${window.HMD_DATA.devices.length} main records, ${a.missing.devices.length} incomplete records and ${a.historical.devices.length} historical device pages. Field evidence retains its actual capture and review dates. See the search-method documentation for collection and update procedures.`:`当前发布：${window.HMD_DATA.devices.length} 条主集、${a.missing.devices.length} 条缺数据记录、${a.historical.devices.length} 条历史设备档案。字段证据保留实际取证与复核时间；检索和更新流程见方法说明。`; }

HMDI18n.applyStatic();
function changeLanguage(language){
 const device=selected?.row.device_id,field=focusField,detailOpen=$('#detail').open,viewerOpen=$('#viewer').open;
 const capture=activeCapture,mode=imageMode,oldZoom=zoom,devicePhoto=activeCapture?.role==='device_image';
 const detailScroll=$('#detail').scrollTop,imageScroll=[$('#image-stage').scrollLeft,$('#image-stage').scrollTop];
 HMDI18n.setLanguage(language);
 switchDataset($('#dataset-view').value,true);renderReleaseSummary();renderCoverageProgress();
 if(detailOpen&&device){openDevice(device,field);$('#detail').scrollTop=detailScroll;}
 if(viewerOpen&&capture){activeCapture=capture;imageMode=mode;showImage();zoom=oldZoom;scaleImage();$('#full-image').onload=()=>{zoom=oldZoom;scaleImage();};
  $('#image-title').textContent=selected.row.name+' · '+(devicePhoto?t('设备页面图'):labels[activeCaptureField]+' · '+captureLabel(capture));
  $('#image-stage').scrollLeft=imageScroll[0];$('#image-stage').scrollTop=imageScroll[1];
 }
}
$('#language').addEventListener('change',()=>changeLanguage($('#language').value));
['detail-language','viewer-language'].forEach(id=>$('#'+id).addEventListener('click',()=>changeLanguage(HMDI18n.language==='zh'?'en':'zh')));

function renderSortState(){
 $('#sort-order').value=sortKey+':'+(ascending?'asc':'desc');
 document.querySelectorAll('[data-sort]').forEach(button=>{
  const active=button.dataset.sort===sortKey;
  const label=HMDI18n.language==='en'?button.dataset.en:button.dataset.zh;
  button.textContent=label.replace('↕',active?(ascending?'↑':'↓'):'↕');
  button.closest('th').setAttribute('aria-sort',active?(ascending?'ascending':'descending'):'none');
 });
}
$('#sort-order').addEventListener('change',()=>{const [key,direction]=$('#sort-order').value.split(':');sortKey=key;ascending=direction==='asc';renderTable();});
