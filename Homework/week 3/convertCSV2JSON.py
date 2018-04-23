import csv
import json

title_file = "Jewish_Victims_WW2"

# path to the csv_file
csv_filename = title_file + ".csv"
json_filename = title_file + ".json"


with open(csv_filename, "r") as infile:
    with open(json_filename, "w") as json_file:
        csv_reader = csv.DictReader(infile)

        for row in csv_reader:
            json.dump(row, json_file)
            json_file.write("\n")
