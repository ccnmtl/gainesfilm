'''
    Use csv exports of gainsfilm data to generate content documents in the content/documents folder
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


#f.close()

# for each in first_line:
#     print str(first_line.index(each)) + each
# 
# '''create file in documents'''
#        print  str(first_line[each]) + str(':')  +  str(line[each])

# new_doc = open('../content/document/' + str(line[1]) + '.md', 'w')
# 
# 
# 
# ---
# ['Node ID', 'Title', 'Body', 'Year', 'Category', 'Course', 'DateAdded', 'Repository', 'Collection', 'Source', 'Copyright', 'Production Company', 'Copyright Notes', 'Film Title', 'Director', 'Photographer', 'Form/Genre', 'Location', 'Physical Description', 'Notes', 'Files']
# 
# 
# 
# for each in first_line:
# ...     print first_line.index(each)
# 
# with open("tab-separated-values") as tsv:
#     for line in csv.reader(tsv, dialect="excel-tab"):
# # temphold = f.readlines()
#     f.seek(0)
#     tempholdlen = len(temphold)
# 
#     '''We should go through the last 10 items
#     in the list and search for the </body></html>
#     tags after finding these we can remove everything 
#     after them. In all cases I have seen the invalid html
#     is only after the valid closing tags'''
#     closingtag = ''
#     for i in range(-10, 0):
#         pb = temphold[i]
#         ph = temphold[i+1]
#         if (pb == "</body>" or pb == "</body>\n") and (ph == "</html>" or ph == "</html>\n" ):
#             closingtag = i+1
#             tempholdlen = tempholdlen + closingtag + 1
#             temphold = temphold[:tempholdlen]
# 
#     for line in temphold:
#         f.write(line)
# 
#     f.truncate()
#     f.close()

