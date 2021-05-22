#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Created on Sun May  9 17:48:33 2021

@author: mdp38
"""

import codecs
import json

def save_json(li, filename = "lotr.json"):
    with codecs.open(filename, 'w', encoding="utf-8") as fout:
        json.dump(li, fout, ensure_ascii=False)
        
        

filename = "region20_upper_matrix.csv"
outfilename = "region20_upper.json"

indexes = [ 903, 935, 908, 904, 905, 909]

def read_matrix(filename):
    with open(filename) as infile:  
        lines = infile.readlines()

    origins =  [x.strip() for x in lines[0].split(',')[1:7]]
    nodes = []
    for i in range(0, len(origins)):
        new_node = {}
        new_node['country'] = origins[i].strip('"')
        new_node['id'] = indexes[i]
        nodes.append(new_node)
        
        
    #source target weight
    edges = []
    for i in range(1, len(lines)):
        elements =  lines[i].split(',')[0:7]
       #new_edge['target'] = elements[0]
        for j, orig in enumerate(origins):
            new_edge ={}
            new_edge['source'] = orig.strip('"')
            new_edge['target'] = elements[0].strip('"')
            new_edge['weight'] = elements[j+1].strip()
            print(new_edge)
            edges.append(new_edge)
    
    results = {}
    results['nodes'] = nodes
    results['edges'] = edges
    
save_json(results, "migration2020_upper2.json")
