# Week 3
# Name: Steven Kuhnen (10305882)
#
# Converts a csv file to a json file

import csv
import json

# string containing filename
filename = "Jewish_Victims_WW2"

# path to the csv and json file
csv_filename = filename + ".csv"
json_filename = filename + ".json"

# read in csv file and put output in a list
with open(csv_filename, "r") as csv_file:
    csv_list = list(csv.DictReader(csv_file))

# write csv list into a json file
with open(json_filename, "w") as json_file:
    data_dic = {"data": csv_list}
    json.dump(data_dic, json_file)
