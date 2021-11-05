#!/usr/bin/env python3

import os
import sys
from xml.sax import parse
from xml.sax.saxutils import XMLGenerator
import datetime

BASE_URL = "https://example.com/"

class CycleFile():
    def __init__(self, filename):
        self.basename, self.ext = os.path.splitext(filename)
        self.index = 0
        self.filenames = []
        self.open_next_file()

    def open_next_file(self):
        self.index += 1
        filename = self.name()
        self.file = open(filename, 'w')
        self.filenames.append(filename)

    def name(self):
        return'%s%s%s' % (self.basename, self.index, self.ext)

    def cycle(self):
        self.file.close()
        self.open_next_file()

    def write(self, str):
        self.file.write(str.decode('utf-8'))

    def close(self):
        self.file.close()


class XMLBreaker(XMLGenerator):
    def __init__(self, break_into=None, break_after=1000, out=None, *args, **kwargs):
        XMLGenerator.__init__(self, out, encoding='utf-8', *args, **kwargs)
        self.out_file = out
        self.break_into = break_into
        self.break_after = break_after
        self.context = []
        self.count = 0

    def startElement(self, name, attrs):
        XMLGenerator.startElement(self, name, attrs)
        self.context.append((name, attrs))

    def endElement(self, name):
        XMLGenerator.endElement(self, name)
        self.context.pop()

        if name == self.break_into:
            self.count += 1
            if self.count == self.break_after:
                self.count = 0
                for element in reversed(self.context):
                    self.out_file.write(b"\n")
                    XMLGenerator.endElement(self, element[0])
                self.out_file.cycle()

                XMLGenerator.startDocument(self)
                for element in self.context:
                    XMLGenerator.startElement(self, *element)


def generate_index(base_url, filenames):
    now = datetime.datetime.now()
    dt = now.strftime("%Y-%m-%d")
    index_content = """<?xml version="1.0" encoding="UTF-8"?>
    <sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
    """

    for filename in filenames:
        index_content += """
            <sitemap>
                <loc>{}</loc>
                <lastmod>{}</lastmod>
            </sitemap>
        """.format(base_url+filename, dt)

    index_content += """
    </sitemapindex>
    """

    # Move current sitemap to backup and write the other one
    os.rename('sitemap.xml', 'backup_sitemap.xml')
    with open('sitemap.xml', 'w') as f:
        f.write(index_content)


def run():
    filename = "sitemap.xml"
    break_into = "url"
    break_after = 10000
    cycle = CycleFile(filename)
    parse(filename, XMLBreaker(break_into, int(break_after), out=cycle))
    generate_index(BASE_URL, cycle.filenames)


if __name__ == '__main__':
    run()

