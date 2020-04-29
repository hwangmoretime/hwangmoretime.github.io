#!/usr/bin/env python
# -*- coding: utf-8 -*- #
from __future__ import unicode_literals

AUTHOR = 'David Hwang'
SITENAME = 'davidhwang.me'
SITEURL = ''

PATH = 'content'

TIMEZONE = 'America/Los_Angeles'

DEFAULT_LANG = 'en'

# Feed generation is usually not desired when developing
FEED_ALL_ATOM = None
CATEGORY_FEED_ATOM = None
TRANSLATION_FEED_ATOM = None
AUTHOR_FEED_ATOM = None
AUTHOR_FEED_RSS = None

# Social widget
SOCIAL = (('You can add links in your config file', '#'),
          ('Another social link', '#'),)

DEFAULT_PAGINATION = False
DEFAULT_DATE_FORMAT = '%d %B %Y'

THEME = 'theme'

STATIC_PATHS = [
    'images',
    'extra/CNAME',
]
EXTRA_PATH_METADATA = {
    'extra/CNAME': {'path': 'CNAME'},
}
STATIC_EXCLUDES = [
    "__pycache__",
]

# Uncomment following line if you want document-relative URLs when developing
# RELATIVE_URLS = True
