'''
    Use csv exports of gainssfilm data to generate content document files in the content/document folder
'''
import csv
from subprocess import call
import os
import sys
import fileinput
import datetime


htmlfile = 'old_content/gainesfilm-document_export.csv - gainesfilm-document_export.csv.tsv'
f = open(htmlfile, 'r')

first_line = f.readline().split('\t')
for line in csv.reader(f, delimiter='\t'):
    abspath = os.path.abspath("../content/document/")
    new_doc = open(abspath + '/' + str(line[1]) + '.md', 'w')
    new_doc.write('---')
    for each in first_line:
        '''get index of the category to pull corresponding
        information from the following lines'''
        category_index = first_line.index(each)
        new_doc.write('\n' + each + str(' : ')  + line[category_index])
    new_doc.write('\n---')
    new_doc.close()
