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
    json.dump(csv_list, json_file)
