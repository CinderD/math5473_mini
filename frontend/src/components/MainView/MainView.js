import * as d3 from 'd3';
import * as echarts from 'echarts';
// import jQuery as $ from 'jquery';

const data = require("../../../public/word_filtered.json");
const top_100_data = require("../../../public/top_100_data.json");
const num_cluster = 5;
// const color_scheme = ["#5470c6", "#91cc75", "#4E79BC", "#fac858", "#ee6666", "#73c0de", "#3ba272", "#fc8452", "#9a60b4", "#ea7ccc"]
const color_sunburst = ["#B76D00", "#4E79BC", "#AE4248", "#FFCFA4", "#E0947C", "#778F3D", "#FFCA0E", "#BFBFBF", "#af7aa1", "#A498CB"]
const color_scheme = ["#c9cba3", "#ffe1a8", "#eb9d91", "#723d46", "#456990"] // color scheme for clusters
const color_scheme2 = ["#c9cba3", "#ffe1a8", "#eba59b", "#723d46", "#456990"] // color scheme for clusters in sunburst
const color_pred = ["#667761", "#545e56", "#917c78", "#b79492", "#eae1df"]

const max_frequency = 0.195
const min_frequency = 0
let keys = Object.keys(data)
let cluster_size_dict = {
  "cluster_one": Object.keys(data[keys[0]]).length,
  "cluster_two": Object.keys(data[keys[1]]).length,
  "cluster_three": Object.keys(data[keys[2]]).length,
  "cluster_four": Object.keys(data[keys[3]]).length,
  "cluster_five": Object.keys(data[keys[4]]).length,
}

console.log("cluster_size_dict", cluster_size_dict)

let time_len = data[keys[0]]["abbott"]["time"].length


// length of time list
console.log("time_len", time_len)

// transform data for main chart
function transform_data(data, keys, time_len) {
  let transformed_data = new Array
  for (let i in keys) {

    let cluster = data[i]
    let clu_size = Object.keys(cluster).length
    // type of data[i]: {"word":{"prediction":0,time:[],vector:[]},...}

    let word_list = Object.keys(cluster)

    for (let j = 0; j < clu_size; ++j) {
      let word = word_list[j] // current word

      for (let k = 0; k < time_len; ++k) {
        let data_instance = {}

        // fill in each data instance, filter out frequency = 0 
        let frequency = cluster[word]["time"][k]
        if (frequency > 0) {
          data_instance["value"] = [k, frequency] // shape: [xAxis,yAxis]. xAxis is time, yAxis is corresponding frequency. Need to separate each time point
          data_instance["name"] = word
          let word_total_frequency = cluster[word]["total_fre"]
          data_instance["symbolSize"] = 30 * word_total_frequency / max_frequency // need to use normalized value
          data_instance["itemStyle"] = {
            color: color_scheme[parseInt(i)]
          },
            transformed_data.push(data_instance)

        }


      }
    }
  }
  return transformed_data
}


let transformed_data = transform_data(data, keys, time_len)

function transform_sunburst_data(top_100_data, num_cluster) {
  let data = []
  for (let i = 0; i < num_cluster; ++i) {
    let instance = {
      name: `cluster ${i}`,
      itemStyle: {
        color: color_scheme2[i]
      },
      children: [
        {
          name: `super low`,
          itemStyle: {
            color: color_pred[0]
          },
          children: []
        },
        {
          name: `low`,
          itemStyle: {
            color: color_pred[1]
          },
          children: []
        },
        {
          name: `median`,
          itemStyle: {
            color: color_pred[2]
          },
          children: []
        },
        {
          name: `high`,
          itemStyle: {
            color: color_pred[3]
          },
          children: []
        },
        {
          name: `super high`,
          itemStyle: {
            color: color_pred[4]
          },
          children: []
        },

      ]
    }

    data.push(instance)

  }
  // fill in data
  for (let j = 0; j < top_100_data.length; ++j) {
    let data_sample = top_100_data[j]
    let cluster = parseInt(data_sample["cluster"])
    let prediction = data_sample["prediction"]
    let pred_index = 0
    switch (prediction) {
      case 'super low':
        pred_index = 0
        break;
      case 'low':
        pred_index = 1
        break;
      case 'median':
        pred_index = 2
        break;
      case 'high':
        pred_index = 3
        break;
      case 'super high':
        pred_index = 4
        break;
    }
    let word = data_sample["word"]

    let rand_color = Math.floor(Math.random()*10)

    let data_item = {
      name: word,
      value: 1,
      itemStyle: {
        color: color_sunburst[rand_color]
      }
    }

    data[cluster]["children"][pred_index]["children"].push(data_item)

  }
  return data
}

let init_sunburst_data = transform_sunburst_data(top_100_data, num_cluster)



export default {
  name: 'MainView',
  props: {
    msg: String
  },
  data() {
    return {
      full_data: transformed_data,
      sunburst_data:init_sunburst_data,

    }
  },

  methods: {
    initial_chart() {

      var chartDom = document.getElementById('mainChart');
      var myChart = echarts.init(chartDom);
      var option;


      option = {
        title: {
          text: 'Word Visualization',
          left: 'center',
          top: 0
        },
        visualMap: {
          min: 0,
          max: 0.014,
          dimension: 1,
          orient: 'vertical',
          right: 10,
          top: 'center',
          text: ['HIGH', 'LOW'],
          calculable: true,
          // inRange: {
          //   color: ['#f2c31a', '#24b7f2']
          // }
        },
        tooltip: {
          trigger: 'item',
          axisPointer: {
            type: 'cross'
          }
        },
        xAxis: [
          {
            type: 'category'
          }
        ],
        yAxis: [
          {
            type: 'value'
          }
        ],
        series: [
          {
            // name: 'word-area',
            type: 'scatter',
            symbolSize: 5,
            data: this.full_data,
            label: {
              show: true,
              position: 'bottom',
              distance: 1,
              // color:'#fff',
              // fontWeight:"bold",
              fontSize: 5,
              formatter: function (params) {
                let str = params.data.name
                return str
              },
            }
          }
        ]
      };
      option && myChart.setOption(option);
    },
    initial_sun_burst() {
      var chartDom = document.getElementById('sunBurst');
      var myChart = echarts.init(chartDom);
      var option;

      option = {
        title: {
          text: 'Frequent Words Prediction',
          subtext: 'The classification results for the top 100 frequent words',
          textStyle: {
            fontSize: 14,
            align: 'center'
          },
          subtextStyle: {
            align: 'center'
          },
        },
        series: {
          type: 'sunburst',
          data: this.sunburst_data,
          radius: [0, '95%'],
          sort: undefined,
          emphasis: {
            focus: 'ancestor'
          },
          levels: [
            {},
            {
              r0: '15%',
              r: '35%',
              itemStyle: {
                borderWidth: 2
              },
              label: {
                rotate: 'tangential'
              }
            },
            {
              r0: '35%',
              r: '70%',
              label: {
                align: 'right'
              }
            },
            {
              r0: '70%',
              r: '72%',
              label: {
                position: 'outside',
                padding: 3,
                silent: false
              },
              itemStyle: {
                borderWidth: 3
              }
            }
          ]
        }
      };
      option && myChart.setOption(option);
    },

    

  },
  mounted() {
    this.initial_chart()
    this.initial_sun_burst()

  }

}