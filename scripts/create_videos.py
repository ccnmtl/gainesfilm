'''
    Use csv exports of gainesfilm data to generate content video files in the content/video folder
'''
import csv
from subprocess import call
import os
import sys
import fileinput
import datetime


htmlfile = 'old_content/gainesfilm-video_export.csv - gainesfilm-video_export.csv.tsv'
f = open(htmlfile, 'r')

counter = 0

first_line = f.readline().split('\t')
for line in csv.reader(f, delimiter='\t'):
    abspath = os.path.abspath("../content/video/")
    '''This chokes on the title - Within Our Gates (dir./prod. Oscar Micheaux  1920)
    was going to add check for / characters and escape them... but since its a one off, just
    going to rename that one file'''
    '''There are also duplicate Titles and Node IDs so I am adding a counter to avoid the duplicates'''
    check_title = line[1]
    if '/' in check_title:
        check_title = check_title.split('/')
        line[1] = "Within Our Gates (dir.- prod. Oscar Micheaux  1920)"
    counter = counter + 1
    new_doc = open(abspath + '/' + str(line[0]) + '-' + str(line[1]) + '-'  + str(counter) + '.md', 'w')
    new_doc.write('---')
    for each in first_line:
        '''get index of the category to pull corresponding
        information from the following lines'''
        category_index = first_line.index(each)
        new_doc.write('\n' + each + str(' : ')  + line[category_index])
    new_doc.write('\n---')
    new_doc.close()
