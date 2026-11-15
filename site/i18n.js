'use strict';
// Reviewed UI vocabulary. Stable data codes and quoted evidence are never translated.
const HMDI18n=(()=>{
 let language='en';try{language=localStorage.getItem('hmd-language')==='zh'?'zh':'en';}catch{}
 const pairs=`提出修改 ↗|Suggest a correction ↗
补充证据 ↗|Add evidence ↗
中心区域分辨率与 FOV|Central-region raster and FOV
外围屏每眼像素|Context-display pixels per eye
整机视场角 FOV|Whole-headset FOV
中心区域 · 每眼 px|Central region · pixels per eye
中心区域|Central region
外围屏：|Context: 
整机：|Whole headset: 
张截图|captures
区间 |Range 
别名与合并记录|Aliases and merged records
参数缺口|Missing parameters
参数说明|Parameter notes
来源|sources
截图|captures
分辨率与质量数据库|Resolution and Mass Database
当前采用数据与依据|Current data and supporting evidence
每一项参数，回到它的依据。|Every parameter leads back to its evidence.
2016年至今完整主集与全年份参数缺口 · 浏览器截图、原句、可信度说明和计算路径|Complete main dataset since 2016 and missing parameters across all years · browser captures, original quotations, evidence scores and calculations
正在加载当前发布数据…|Loading the current release…
刷新数据|Refresh data
关键工作参数是否齐备？|Are the working parameters complete?
充分，且年份 ≥ 2016|Complete, year ≥ 2016
仍有关键参数缺口|Key parameters still missing
01 · 核对全目录|01 · Check the full catalogue
所有年份、型号、版本、配置|All years, models, versions and configurations
02 · 浏览器逐项取证|02 · Capture field evidence in the browser
参数原句、来源链接、评分理由|Quotations, URLs and scoring reasons
保存实际截图与透明高亮|Save actual captures and transparent highlights
核对型号、单位、轴向、截图|Check model, units, axes and screenshots
2016 年至今 · 完整主集|Since 2016 · complete main dataset
工作参数齐备|Working parameters complete
保留最新采用数据和证据|Keep the current adopted data and evidence
全年份 · 缺数据集|All years · incomplete dataset
保留已有依据，列明具体缺口|Keep existing evidence; identify specific gaps
查看范围|Dataset view
2016年至今 · 完整主数据集|Since 2016 · complete main dataset
2016年前 · 完整设备档案|Before 2016 · complete device archives
全年份 · 所有不完整设备|All years · incomplete devices
来源构成|Source composition
来源统计口径|Source counting method
去重来源页面数|Unique source pages within each category
字段—来源关联次数|Field–source associations
覆盖设备数（可重叠）|Device coverage (overlapping)
设备目录 |Device catalogue 
清除筛选|Clear filters
搜索设备、厂商、来源或证据原句|Search device, manufacturer, source or original quotation
搜索设备|Search devices
设备类别|Device category
全部设备类别|All device categories
来源类别|Source category
全部来源类别|All source categories
校准参考|Calibration reference
全部PPD类型|All PPD types
官方值|Official value
第三方值|Third-party value
第三方 PPD（仅供参考）|Third-party PPD (reference only)
算法估算值|Algorithm estimate
缺失|Missing
设备 ↕|Device ↕
类别|Category
年份 ↕|Year ↕
质量/g ↕|Mass / g ↕
分辨率 ↕|Resolution ↕
每眼宽 × 高 / px|Per-eye width × height / px
采用值与轴向|Adopted value and axis
光学／显示配置|Optics / display configuration
采用来源类型|Adopted source types
极简证据链|Compact evidence chain
当前数据文件|Current data files
主集 CSV|Main dataset CSV
缺数据集 CSV|Incomplete dataset CSV
截图追溯清单|Capture provenance manifest
最近字段复核 |Latest field review 
台当前正式记录 · 采集自查记录可追溯 · 计算与用途自动校验| current formal records · traceable collection self-reviews · automated checks of calculations and uses
关闭设备详情|Close device details
证据链|Evidence chain
点击参数查看原句和截图；来源节点打开原网站。虚线表示模型输入。|Click a parameter for quotations and captures; source nodes open the original website. Dashed lines indicate model inputs.
来源截图|Source screenshot
切换未高亮图|Show original capture
切换高亮|Show highlighted capture
缩小截图|Zoom out
放大截图|Zoom in
适应窗口|Fit to window
图片尺寸|Actual size
打开对应来源 ↗|Open source ↗
关闭截图|Close screenshot
浏览器来源截图|Browser source screenshot
设备分类|Device category
公告年份|Announcement year
头戴质量|Head-worn mass
官方裸机质量（仅头显）|Official bare-headset mass
显示类型|Display type
厂商报告 PPD（口径未说明）|Manufacturer-reported PPD (scope unspecified)
每眼像素|Per-eye pixels
视场角 FOV|Field of view (FOV)
补充 FOV 规格|Additional FOV specification
光学结构|Optical structure
实际发售／供货|Actual release / shipping
预计供货|Planned availability
公开展示|Public demonstration
计划展示|Planned demonstration
提前上手|Preview
公告|Announcement
众筹|Crowdfunding
原型|Prototype
概念|Concept
待分类来源|Unclassified source
简要证据链| compact evidence chain
设备 → |Device → 
项参数 → | parameters → 
类来源 → | source categories → 
条截图关联（可能重复使用同一截图）| capture associations (a capture may be reused)
参数| params
，点击展开设备证据|; open device evidence
条截图关联，点击查看| capture associations; click to view
图| img
跨类覆盖计次|Coverage across categories
页面分类计次|Page category counts
字段关联|Field associations
筛选采用此类来源的设备|Filter devices using this source category
同一设备可出现在多类中，比例表示覆盖计次构成。|A device may occur in multiple categories. Percentages describe overlapping coverage counts.
每类内部按 URL 去重；同一页面可跨类别重复计数，全局唯一页面数见上方。不代表独立测量数量。|URLs are deduplicated within each category. A page may occur in multiple categories; the global unique count is above. Counts do not represent independent measurements.
一个字段可以关联多个来源，包括设备参数、分类依据和明确标记的模型输入引用。|A field may link to multiple sources documenting device specifications, classifications and explicitly identified model inputs.
单目|Monocular
每眼|Per eye
来源排列|Source order
宽 × 高|Width × height
多分辨率显示|Multi-resolution display
查看证据 →|View evidence →
估算区间 |Estimated interval 
没有匹配的设备，请调整筛选。|No matching devices. Adjust the filters.
此范围内暂无设备记录。|No device records in this collection.
横向（默认）|Horizontal (project default)
横向|Horizontal
纵向|Vertical
对角线|Diagonal
菲涅尔／非球面混合|Hybrid Fresnel / aspheric
混合菲涅尔|Hybrid Fresnel
非菲涅尔|Non-Fresnel
菲涅尔|Fresnel
非球面|Aspheric
自由曲面棱镜|Freeform prism
自由曲面导光中继|Freeform lightguide relay
自由曲面|Freeform
光波导|Waveguide
半反射合光器|Semi-reflective combiner
自由空间合光器|Free-space combiner
可调透镜目镜|Adjustable lens eyepieces
离轴半反射镜|Off-axis half-silvered mirror
光束转向透镜|Beam-steering lenses
双透镜折射系统|Dual-lens refractive system
半透镜合光器|Semi-transparent mirror beam combiner
曲面反射镜|Curved mirrors
投影器／反射器|Projector / reflector
镜片投影|Lens projection
别名|Aliases
透镜光学|Lens optics
目镜光学|Eyepiece optics
折反射光学|Catadioptric optics
四片透镜组件|Four-element lens assembly
反射镜／透镜投影系统|Mirror-and-lens projector
专有 VR 镜片|proprietary VR lenses
棱镜|Prism
上限 |Upper bound 
下限 |Lower bound 
约 |≈ 
组件质量；整机缺失|Component mass; complete assembly missing
整机|Complete assembly
实测|Measured
来源估计|Source estimate
部件合计|Component sum
来源范围中点|Source range midpoint
来源范围端点|Source range endpoint
焦点显示区|Focus region
中心|Central
峰值|Peak
平均|Average
配置变体 · |Configuration variant · 
非矩形有效显示区|Nonrectangular active area
公布／概念设备|Announced / concept device
实际光学|Physical optics
模型分组|Model group
字段到来源的证据树| field-to-source evidence tree
设备当前记录|Current device record
查看|View 
证据| evidence
 · 计算| · calculated
来源截图| source screenshot
来源的实际截图| actual source capture
截图|Capture
几何计算|Geometric calculation
光学组校准|Optical-group calibration
SARC 结构与轴向校准|SARC structure- and axis-aware calibration
估算区间：|Estimated interval: 
外观／页面上下文|Appearance / page context
计算输入依据|Calculation input evidence
采用参数依据|Adopted parameter evidence
参数证据|Parameter evidence
证据评分 |Evidence score 
支持强度，不是正确概率|Strength of support, not probability of correctness
这是项目推导值，外部来源没有直接报告该PPD；请查看计算与输入依据。|This is a project-derived value, not a PPD directly published by an external source. See the calculation and input evidence.
尚无可采用的对应参数依据。|No adoptable evidence for this parameter yet.
来源截图 |Source captures 
点击放大|Click to enlarge
截图分别关联来源页面，可切换未高亮图。展示图经过压缩，保留原分辨率；原始文件指纹与来源关联见 |Captures link to their source pages; unhighlighted views are available. Display images are compressed at their original resolution. Original-file fingerprints and source associations are in the 
设备页面图|Device page image
设备来源页图，仅用于设备外观说明|Device source-page image, for appearance only
设备来源页图，仅用于外观说明|Device source-page image, for appearance only
类别依据 · |Category evidence · 
证据时间：|Evidence time: 
未记录|Not recorded
设备页面图，说明用途|Device page image, illustration only
本数据集设备|Devices in this dataset
采用来源页面|Adopted source pages
PPD缺失|Missing PPD
当前发布：主集 |Current release: main dataset 
 台 · 缺数据辅助集 | devices · incomplete auxiliary dataset 
 台 · 历史档案 | devices · historical archives 
 台 · 最近字段复核 | devices · latest field review 
 条：| entries: 
数据加载失败：|Data loading failed: 
HRMD · 头戴式显示设备分辨率与质量数据库|HRMD · HMD Resolution and Mass Database
数据库原则：在尽量保证可信性的情况下做加法。全目录逐台复核，主集与缺数据集分别展示；2016年前完整设备提供档案查看入口。|The database adds evidence while maintaining credible support. Devices are reviewed individually across the full catalogue. Complete and incomplete records are shown separately, with an archive entry for complete devices before 2016.
2016 年前参数完整的设备可通过“完整设备档案”入口查看，仍不纳入2016年至今主集，也不因年份归入缺数据集。官方依据匹配且充分即采用；官方缺项可使用可靠第三方。单次访问失败、非官方来源、估计值或未知 FOV 轴向不自动删除设备。未审条目单独记为待复核，不冒称缺数据结论或审核通过。主数据集中的“完整”指类别、年份、整机质量、每眼像素、FOV、光学和工作 PPD 齐备；有来源的重量界限保留原始不等式，不因此排除设备，也不自动当作等号计算；校准参考资格另行记录。PPD 最终采用官方值或项目算法估算值；第三方 PPD 仅供参考，计算方法在推导中说明。|Complete devices before 2016 remain accessible through the device archives, outside the main dataset since 2016; their year alone does not put them in the incomplete dataset. Sufficient, matching official evidence is preferred, with reliable third-party evidence used for official omissions. Failed access, nonofficial sources, estimates and unspecified FOV axes do not automatically remove devices. Unreviewed entries remain pending without a claim of missing data or a passed review. Complete main records have category, year, complete head-worn mass, per-eye pixels, FOV, optics and working PPD. Sourced mass bounds retain their inequalities; they neither exclude devices nor become exact point values automatically. Calibration-reference eligibility is recorded separately. Adopted PPD is official or a project algorithm estimate. Third-party PPD is reference-only; calculation methods are documented in their derivations.
设备类别统一为一体机VR、PC VR、AR。类别依据采用来源中的设备类型与连接方式；支持手机连接不等于没有固定显示屏，也不能据此判定为PC VR。|Device categories are Standalone VR, PC VR and AR. Classification follows source descriptions of device type and connections. Phone connectivity does not imply the absence of a built-in display and is insufficient to classify a device as PC VR.
来源类型不等于可信度分数。厂商材料的第三方承载与官网分开；照片不计参数来源。模型PPD外链表示输入依据。|Source type is distinct from evidence score. Third-party hosting of manufacturer materials is separate from official websites. Illustrations are not parameter sources. External links for model PPD document its inputs.
全部参数直接列出；点击参数可查看对应依据。FOV 未注明轴向时默认横向，分辨率保留采用口径，PPD 位于最后一列。宽表可横向滚动。|All parameters are listed directly. Click a parameter for its evidence. FOV defaults to horizontal when unspecified; resolution retains its adopted convention. PPD is in the final column. Scroll horizontally to see the full table.
筛查流程：仅输出完整主集与全年份缺数据集|Screening process: publish the complete main dataset and the all-year incomplete dataset
PPD类型|PPD type
来源原文（保留原语言）|Original source quotation (language preserved)
采用依据|Adoption rationale
折叠光学（Pancake）|Pancake
鸟浴式（Birdbath）|Birdbath
2016年至今的完整参数主集；重量界限保留原始不等式；PPD 采用官方值或项目算法估算值。|Complete records since 2016. Mass bounds retain their original inequalities. PPD uses official values or project algorithm estimates.
2016年前参数完整的设备档案；可查看全部参数与证据。|Complete device archives before 2016, with all parameters and evidence available.
保留已有参数及来源证据，缺失字段与估算输入限制分别说明。|Available parameters and source evidence are retained. Missing fields and limitations of estimation inputs are identified separately.
年份|Year
查看此来源的实际截图|View the actual source capture
焦点区域校准参数|Focus-region calibration inputs
质量组成与排除项|Mass components and exclusions
型号与配置|Model and configuration
设备系列标识|Device family ID
设备系列|Device family
`;
 const entries=pairs.trim().split('\n').map(line=>line.split('|'));
 const en=Object.fromEntries(entries);const keys=Object.keys(en).sort((a,b)=>b.length-a.length);
 const pattern=new RegExp(keys.map(s=>s.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')).join('|'),'g');
 const t=text=>language==='zh'?String(text??''):String(text??'').replace(pattern,key=>en[key]);
 const ui=(parts,...values)=>parts.map((part,i)=>t(part)+(i<values.length?values[i]:'')).join('');
 const dictionary=object=>new Proxy(object,{get:(target,key)=>typeof target[key]==='string'?t(target[key]):target[key]});
 const categories={一体机:['一体机VR','Standalone VR'],'Standalone VR':['一体机VR','Standalone VR'],'PC VR':['PC VR','PC VR'],'PC-Powered VR':['PC VR','PC VR'],AR:['AR','AR'],'AR Glasses':['AR','AR']};
 const category=value=>categories[value]?.[language==='en'?1:0]||value;
 const sources={other:['其他来源','Other sources'],official:['厂商自有官网／官方文档','Manufacturer website / official documentation'],manufacturer_hosted:['厂商材料 · 第三方承载','Manufacturer materials · third-party hosting'],vr_compare:['VR-Compare 设备数据库','VR-Compare device database'],media:['科技媒体／原始评测','Technology media / original reviews'],partner:['分销／产业合作伙伴','Distributors / industry partners'],institution:['学术／政府机构资料','Academic / government sources'],community:['社区／专业资料库','Community / specialist databases'],archived_source:['已保存的参数来源','Archived parameter source']};
 const source=(key,fallback)=>sources[key]?.[language==='en'?1:0]||t(fallback||'待分类来源');
 function applyStatic(){document.documentElement.lang=language==='en'?'en':'zh-CN';document.querySelectorAll('[data-i18n]').forEach(node=>node.textContent=language==='en'?node.dataset.en:node.dataset.zh);document.querySelectorAll('[data-i18n-attrs]').forEach(node=>{for(const attr of node.dataset.i18nAttrs.split(','))node.setAttribute(attr,language==='en'?node.getAttribute('data-en-'+attr):node.getAttribute('data-zh-'+attr));});const control=document.querySelector('#language');if(control)control.value=language;}
 function setLanguage(value){language=value==='en'?'en':'zh';try{localStorage.setItem('hmd-language',language);}catch{}applyStatic();}
 // Display translations are separate from immutable evidence and source quotations.
 function projectText(text){const value=String(text??'');if(language==='en')return window.HMD_PROJECT_EN?.[value]??t(value);
  if(window.HMD_PROJECT_ZH?.[value])return window.HMD_PROJECT_ZH[value];
  let translated=value;
  for(const [enText,zhText] of Object.entries(modelNotes))translated=translated.replaceAll(enText,zhText);
  // Exact segments only: never rewrite words inside source locators or device IDs.
  return translated.split(/(\s*\|\s*|;\s*)/).map(part=>window.HMD_PROJECT_ZH?.[part]??part).join('');}
 const modelNotes={
  'Source FOV axis unspecified; catalogue default is horizontal. SARC uses diagonal raster / recorded FOV for small-FOV model inputs, without changing source evidence.':'来源未注明 FOV 轴向，目录默认横向。SARC 对小视场模型输入使用像素对角线／记录 FOV 的比值，不改写来源证据。',
  'SARC global manufacturer-weighted median is used because this optical group has no fitted group-specific correction.':'此光学组没有拟合的专属修正，使用 SARC 全局厂商等权中位数。',
  'SARC prepared inputs require recorded and resolved FOV spans below 180 degrees.':'SARC 预处理要求记录的 FOV 及解析后的轴向视场跨度均小于 180°。',
  'Bound/maximum FOV input yields a nominal proxy, not an exact measured PPD point or a validated PPD bound.':'FOV 界限／最大值输入产生标称近似值，不能视为精确实测 PPD 或已验证的 PPD 界限。',
  'FOV axis or magnitude is estimated/conditional, not independently confirmed by this calculation.':'FOV 轴向或大小属于估计／条件值，此计算不构成其独立确认。',
  'Model residual interval excludes input, axis, configuration and extrapolation uncertainty.':'模型残差区间不包含输入、轴向、配置和外推的不确定性。',
  'Not measured PPD; nominal panel pixels and adopted FOV geometry.':'并非实测 PPD；使用标称面板像素与采用的 FOV 几何口径。',
  'Nonrectangular active area retained: source-reported axis spans are used, not a rectangular total-pixel count.':'保留非矩形点亮区域说明；估算使用来源报告的轴向像素跨度，不按完整矩形计算总像素。',
  'Optics group has no supported current calibration references.':'此光学组暂无有证据支持的当前校准参考。',
  'Rectangular active area, square pixels and rectilinear projection are conditional assumptions.':'矩形有效显示区、正方形像素和直线投影属于条件假设。',
  'Source FOV axis remains unspecified; diagonal axis is assumed for this conditional calculation.':'来源未注明 FOV 轴向；此条件计算假设对角线口径。',
  'Source FOV axis unspecified; nominal angle used as span proxy.':'来源未注明 FOV 轴向；使用标称角度作为跨度近似值。',
  'Uncalibrated geometric proxy; no supported calibration interval.':'未经校准的几何近似值；暂无有证据支持的校准区间。'
 };
 function modelText(text){return projectText(text);}
 function original(text){return String(text??'');}
 return {t,ui,dictionary,category,source,original,projectText,modelText,applyStatic,setLanguage,get language(){return language;},entries};
})();
const {t,ui}=HMDI18n;
