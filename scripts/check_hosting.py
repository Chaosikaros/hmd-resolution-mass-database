"""Verify that contribution links target the deployed GitHub repository."""
from pathlib import Path
import os
import re

text=(Path(__file__).resolve().parents[1]/'site/site-config.js').read_text(encoding='utf-8')
mode=re.search(r"submissionMode:\s*['\"]([^'\"]+)['\"]",text)
repository=re.search(r"repository:\s*['\"]([^'\"]*)['\"]",text)
if not mode or mode[1]!='github':raise SystemExit('Set submissionMode to github before deployment.')
if not repository or repository[1]!=os.environ['EXPECTED_REPO']:raise SystemExit('Set repository to the exact GitHub owner/repository receiving these issues.')
print('GitHub issue destination configured.')
