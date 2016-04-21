#!/usr/bin/env python3
from requests import Session
import os
import yaml
from bs4 import BeautifulSoup


HOST = "gainesfilm.qa-lamp.ccnmtl.columbia.edu"
NUM_PAGES = 18


class Site(object):
    def __init__(self, username, password):
        self.username = username
        self.password = password
        self.session = None

    def url(self):
        return "http://{}/user".format(HOST)

    def login(self):
        self.session = Session()
        # drupal requires that you first GET the form
        r = self.session.get(self.url())
        # then POST to it
        s = self.session.post(
            self.url(), data={
                'name': self.username, 'pass': self.password,
                'form_id': 'user_login',
                'op': 'Log in',
            },
            headers={
                'referer': self.url(),
            }
        )
        print("=== logged in ===")
        return self.session

    def get_session(self):
        if self.session is not None:
            return self.session
        self.session = self.login()
        return self.session

    def get_library_page(self, page):
        return LibraryPage(self.session, page)


class Fetchable(object):
    def fetch(self):
        if self.soup is not None:
            return self.soup
        r = self.session.get(self.url())
        self.text = r.text
        self.soup = BeautifulSoup(self.text, "html.parser")
        return self.soup


class LibraryPage(Fetchable):
    def __init__(self, session, pagenum):
        self.session = session
        self.pagenum = pagenum
        self.text = ""
        self.soup = None

    def base_url(self):
        return "http://{}/library".format(HOST)

    def url(self):
        return "{}?page={}".format(self.base_url(), self.pagenum)

    def linked_nodes(self):
        soup = self.fetch()
        for tr in soup('tr'):
            if tr.td is None:
                continue
            td = tr.td
            a = td.find('a')
            if a is None:
                continue

            path = a.attrs['href']
            try:
                ntype = td.next_sibling.next_sibling.next_sibling.next_sibling.ul.li.a.string
                yield NodePage(self.session, ntype, path)
            except AttributeError:
                pass


def escape(s):
    return s.replace('\'', '\\\'')


class BaseType(object):
    def __init__(self, path, soup):
        self.path = path
        self.soup = soup

    def as_dict(self):
        d = {
            'title': str(self.title()),
            'taxonomies': list(self.taxonomies()),
            'year': self.year(),
            'repository': self.repository(),
            'location': self.location(),
            'collection': self.collection(),
            'copyright': self.copyright(),
            'copyright_notes': self.copyright_notes(),
            'film_title': self.film_title(),
            'director': self.director(),
            'physical_description': self.physical_description(),
            'notes': self.notes(),
        }
        d.update(self.extra_fields())
        return d

    def as_yaml(self):
        d = self.as_dict()
        return "---\n" + yaml.dump(d) + "\n---\n"

    def local_path(self):
        return "content/{}/{}.md".format(self.ntype(), self.basename())

    def basename(self):
        return os.path.basename(self.path).replace('%', '')

    def title(self):
        return self.soup.h1.string

    def get_field1(self, fieldname):
        d = self.soup.find('div', class_="field-field-{}".format(fieldname))
        try:
            return d.div.div.div.next_sibling.div.p.string.strip()
        except AttributeError:
            return ''

    def get_field2(self, fieldname):
        d = self.soup.find('div', class_="field-field-{}".format(fieldname))
        try:
            return d.div.div.div.next_sibling.string.strip()
        except AttributeError:
            return ''

    def get_field3(self, fieldname):
        d = self.soup.find('div', class_="field-field-{}".format(fieldname))
        try:
            return d.div.next_sibling.div.string.strip()
        except AttributeError:
            return ''

    def get_field(self, fieldname):
        r = self.get_field1(fieldname)
        if r != '':
            return r
        r = self.get_field2(fieldname)
        if r != '':
            return r
        return self.get_field3(fieldname)

    def taxonomies(self):
        s = self.soup.find('span', class_='taxonomy')
        for li in s.ul.find_all('li'):
            yield str(li.a.string)

    def repository(self):
        return self.get_field("repository")

    def location(self):
        return self.get_field('bibliographic-citation')

    def image_src(self):
        return ''

    def year(self):
        return self.get_field("date")

    def collection(self):
        return self.get_field('collection')

    def copyright(self):
        return self.get_field('copyright')

    def copyright_notes(self):
        return self.get_field('copyright-notes')

    def film_title(self):
        return self.get_field('filmtitle')

    def director(self):
        return self.get_field('director')

    def physical_description(self):
        return self.get_field('physical-description')

    def notes(self):
        return self.get_field("notes")


class Image(BaseType):
    def ntype(self):
        return "image"

    def image_src(self):
        img = self.soup.find('img', class_='image-preview')
        src = img.attrs['src']
        return src.replace('.preview', '')

    def physical_description(self):
        return self.get_field('physical-description')

    def extra_fields(self):
        return {
            'src': self.image_src(),
        }


class Video(BaseType):
    def ntype(self):
        return "video"

    def extra_fields(self):
        return {}


class Document(BaseType):
    def ntype(self):
        return "document"

    def image_src(self):
        img = self.soup.find('img', class_='image-preview')
        src = img.attrs['src']
        return src.replace('.preview', '')

    def repository(self):
        return self.get_field("repository")

    def extra_fields(self):
        return {
            'src': self.image_src(),
        }


node_types = {
    'Image': Image,
    'Document': Document,
    'Video': Video,
}


class NodePage(Fetchable):
    def __init__(self, session, ntype, path):
        self.session = session
        self.ntype = ntype
        self.path = path
        self.text = ""
        self.soup = None

    def url(self):
        return "http://{}{}".format(HOST, self.path)

    def get(self):
        return node_types[self.ntype](self.path, self.fetch())



def main():
    username = os.environ['GAINES_USER']
    password = os.environ['GAINES_PASSWORD']

    s = Site(username, password)
    s.login()

    for pagenum in range(NUM_PAGES + 1):
        lp = s.get_library_page(pagenum)
        for node in lp.linked_nodes():
            nt = node.get()
            filename = nt.local_path()
            print(filename)
            with open(filename, 'w') as f:
                f.write(nt.as_yaml())

if __name__ == "__main__":
    main()
