import torch
import pandas as pd
import numpy as np
from transformers import BertTokenizer, BertModel
from sklearn.cluster import KMeans
from hmmlearn import hmm
import json
import math
import warnings

warnings.filterwarnings('ignore')
# --------------------pre-processed-------------------
#----------1. 通过Bert Pre-trained Model得到每个词的词向量编码
# tokenizer = BertTokenizer.from_pretrained('bert-base-uncased')
# model = BertModel.from_pretrained('bert-base-uncased')
# # 将单词转换为BERT输入格式，并将其传递给BERT模型以获取相应的词向量
# def word2vec(word):
#     tokens = tokenizer.encode(word, add_special_tokens=False, return_tensors='pt')
#     outputs = model(tokens)
#     last_hidden_state = outputs.last_hidden_state
#     word_vector = last_hidden_state[0][0]
#     return word_vector.detach().numpy().tolist()
# result_w2v = []
# df = pd.read_csv('NIPS_1987-2015.csv')
# header = list(df.columns)[1:]
# num_cols = df.shape[1]
# word_list = df.iloc[:, 0]
# sumList = []
# for t in range(len(header)):
#     k_temp = sum(df.iloc[:, t+1])
#     if k_temp <= 0:
#         sumList.append(2000)
#     else:
#         sumList.append(k_temp)
# print(sumList)

# def frequencyAdd(header, i, sumList):
#     last = 0
#     num = 0
#     result = []
#     for t in range(len(header)):
#         current = header[t].split('_')[0]
#         if current != last:
#             if num != 0:
#                 result[-1] /= num
#             result.append(0)
#             last = current
#             num = 0
#         if t == len(header) - 1:
#             result[-1] /= num
#         num += 1
#         result[-1] += df.iloc[:, t+1][i]/sumList[t]
#     return result

# for i, w in enumerate(word_list):
#     print(i)
#     # if i > 100:
#     #     break
#     try:
#         result_w2v.append([w, word2vec(w), frequencyAdd(header, i, sumList)])
#     except:
#         continue
# np.save('w2v.npy', np.array(result_w2v, dtype=object))

# # ----------2. 读取词向量进行k-means聚类，类别自己设置
# class_number = 5
# w2v = np.load('w2v.npy', allow_pickle = True)
# v_list = []
# for w in w2v:
#     v_list.append(w[1])
# kmeans = KMeans(n_clusters=class_number, random_state=0)
# kmeans.fit(v_list)
# labels = kmeans.labels_
# print(labels) # 得到每个词的类别

# json_result = {}
# MIN = 9e-10
# V1 = []
# V2 = []
# model = hmm.GaussianHMM(n_components=3, covariance_type="full", n_iter=100)
# # ----------3. 统计每个类中词出现的频率
# def statisticalWord(w2v, labels, label, count):
#     result = [0] * len(w2v[0][2])
#     for i in range(len(labels)):
#         if labels[i] != label:
#             continue
#         print(label, count)
#         count += 1
#         lst1 = w2v[i][2]
#         result = [x + y for x, y in zip(lst1, result)]
#         json_result[label][w2v[i][0]] = {}
#         json_result[label][w2v[i][0]]['vevtor'] = w2v[i][1]
#         json_result[label][w2v[i][0]]['time'] = lst1[0:-1]
#         serie = np.array([i * 100000 + 1 for i in lst1[0:-1]])
        
#         # for s in range(len(serie)):
#         #     if math.isinf(serie[s]) or math.isnan(serie[s]):
#         #         serie[s] = MIN
#         # print(serie.reshape(-1, 1))
        
#         # ----------4. 对最后一年做一个预测
#         try:
#             model.fit(serie.reshape(-1, 1))
#             next_state_prob = model.transmat_[-1]
#             next_state = np.random.choice(model.n_components, p=next_state_prob)
#             next_observation = model.means_[next_state]
#             # print(next_observation/100000) #下一个观测值即是预测结果
#             json_result[label][w2v[i][0]]['prediction'] = list(next_observation/100000)
#             V1.append(next_observation[0]/100000)
#             V2.append(lst1[-1])
#             print(next_observation[0]/100000, lst1[-1])
#         except:
#             print('*********except***********')
#             json_result[label][w2v[i][0]]['prediction'] = lst1[-2]
#     return result[0:-1]

# for j in range(class_number):
#     if not j in json_result.keys():
#         json_result[j] = {}
#     data = statisticalWord(w2v, labels, j, 0)

# with open("word.json",'w',encoding='utf-8') as f:
#     json.dump(json_result, f)

# 存储MSE
# np.save('prediction_groundtruth.npy', np.array([V1, V2]))

# 读取MSE进行计算
data = np.load('prediction_groundtruth.npy', allow_pickle = True)
arr1 = np.array(data[0])
arr2 = np.array(data[1])

smape = np.mean(2.0 * np.abs(arr1 - arr2) / (np.abs(arr1) + np.abs(arr2))) * 100
mae = np.abs(arr1 - arr2).mean()
print(mae)


