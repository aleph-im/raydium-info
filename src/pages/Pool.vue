<template>
  <q-page>
    <h4>
      <q-avatar>
        <img :src="pool.coin.logoURI" />
      </q-avatar>
      <q-avatar style="margin-left: -12px">
        <img :src="pool.pc.logoURI" />
      </q-avatar>
      {{ pool.coin.symbol }}-{{ pool.pc.symbol }} Pool
    </h4>
    <div class="flex q-mb-md justify-between">
      <div class="row q-gutter-sm">
        <q-card class="q-pa-sm bg-dark-60">
          <q-avatar size="sm">
            <img :src="pool.pc.logoURI" />
          </q-avatar>
          1 {{ pool.pc.symbol }} = {{ (1/pool.stats.price).toFixed(4) }} {{ pool.coin.symbol }}
        </q-card>
        <q-card class="q-pa-sm bg-dark-60">
          <q-avatar size="sm">
            <img :src="pool.coin.logoURI" />
          </q-avatar>
          1 {{ pool.coin.symbol }} = {{ (pool.stats.price).toFixed(4) }} {{ pool.pc.symbol }}
        </q-card>
      </div>
      <div class="q-gutter-md">
        <q-btn color="card" label="Add liquidity" type="a" :href="`https://raydium.io/liquidity/?ammId=${pool.ammId}`" />
        <q-btn color="primary" label="Swap" type="a" :href="`https://raydium.io/swap/?ammId=${pool.ammId}`" />
      </div>
    </div>
    <div class="flex q-gutter-md q-mb-md items-stretch">
      <q-card class="bg-card col-auto" style="min-width: 300px">
        <q-card-section>
          <q-card class="shadow-0 bg-dark-60">
            <q-card-section>
              <h6 class="q-ma-none q-pb-sm">Total tokens locked</h6>
              <div
                class="row justify-between items-center q-mb-sm q-gutter-md"
              >
                <span>
                  <q-avatar size="sm">
                    <img :src="pool.coin.logoURI" />
                  </q-avatar>
                  {{ pool.coin.symbol }}
                </span>
                <span>
                  {{ numeral(pool.stats.tvl_coin).format("0,0.00") }}
                </span>
              </div>
              <div
                class="row justify-between items-center q-mb-sm q-gutter-md"
              >
                <span>
                  <q-avatar size="sm">
                    <img :src="pool.pc.logoURI" />
                  </q-avatar>
                  {{ pool.pc.symbol }}
                </span>
                <span>
                  {{ numeral(pool.stats.tvl_pc).format("0,0.00") }}
                </span>
              </div>
            </q-card-section>
          </q-card>
          <p class="q-pt-md text-bold q-mb-none">TVL</p>
          <p class="text-h5">
            {{ numeral(pool.stats.tvl_usd).format("0,0 $") }}
          </p>
          <p class="q-pt-md text-bold q-mb-none">Volume (24h)</p>
          <p class="text-h5">
            {{ numeral(pool.stats.vol24h).format("0,0 $") }}
          </p>
        </q-card-section>
      </q-card>
      <div class="col-grow">
        <q-card class="bg-card">
          <q-tabs
            v-model="chartTab"
            dense
            class="text-grey"
            active-color="white"
            indicator-color="white"
            align="right"
            narrow-indicator
          >
            <q-tab name="price" label="Price" />
            <q-tab name="tvl" label="TVL" />
            <q-tab name="volume" label="Volume" />
          </q-tabs>
          <q-separator />
          <q-tab-panels v-model="chartTab" animated>
            <q-tab-panel name="price" class="bg-dark-60">
              <apexchart type="area" height="350" :options="priceChartOptions" :series="priceSeries"></apexchart>
            </q-tab-panel>
            <q-tab-panel name="tvl" class="bg-dark-60">
              <apexchart type="area" height="350" :options="tvlChartOptions" :series="tvlSeries"></apexchart>
            </q-tab-panel>
            <q-tab-panel name="volume" class="bg-dark-60">
              <apexchart type="area" height="350" :options="volumeChartOptions" :series="volumeSeries"></apexchart>
            </q-tab-panel>
          </q-tab-panels>
        </q-card>
      </div>
    </div>
    <events-table :events="events" />
  </q-page>
</template>


<script>
import { defineComponent } from "vue";

import poolquery from "../queries/pool_detail.gql";
import { client } from "../services/graphql";
import numeral from "numeral";
import moment from "moment";
import EventsTable from "src/components/EventsTable.vue";

export default defineComponent({
  components: { EventsTable },
  name: "PoolPage",
  props: {
    address: String,
  },
  data() {
    return {
      chartTab: 'price'
    }
  },
  computed: {
    priceSeries() {
      let values = []
      let last_value = null
      for (let point of this.pool_hourly_data) {
        if (point.price !== null) {
          last_value = point.price
        }
        values.push(last_value)
      }
      return [
        {
          name: "price",
          data: values,
        },
      ]
    },
    volumeSeries() {
      return [
        {
          name: "volume",
          data: this.pool_hourly_data.map((m) => m.volume),
        },
      ]
    },
    tvlSeries() {
      let values = []
      let last_value = null
      let has_usd = this.pool.pc.symbol.includes("USD")
      let tvl_key = "tvl_usd"
      if (!has_usd)
        tvl_key = "tvl_coin"
      for (let point of this.pool_hourly_data) {
        if (point[tvl_key] !== null) {
          last_value = point[tvl_key]
        }
        values.push(last_value)
      }
      return [
        {
          name: "tvl",
          data: values,
        },
      ]
    },
    priceChartOptions() {
      return {
        yaxis: {
          labels: {
            formatter: function (val) {
              return val.toFixed(4);
            }
          }
        },
        ...this.chartOptions
      }
    },
    tvlChartOptions() {
      let has_usd = this.pool.pc.symbol.includes("USD")
      let tvl_format = "0,0 $"
      if (!has_usd) {
        tvl_format = `0,0 ${this.pool.coin.symbol}`
      }
      return {
        yaxis: {
          labels: {
            formatter: function (val) {
              if (has_usd)
                return numeral(val).format(tvl_format);
            }
          }
        },
        ...this.chartOptions
      }
    },
    volumeChartOptions() {
      return {
        yaxis: {
          labels: {
            formatter: function (val) {
              return numeral(val).format("0,0 $");
            }
          }
        },
        ...this.chartOptions
      }
    },
    chartOptions() {
      return {
        chart: {
          type: "area",
          stacked: false,
          height: 350,
          zoom: {
            zoom: {
              type: 'x',
              enabled: true,
              autoScaleYaxis: true
            },
            toolbar: {
              autoSelected: 'zoom'
            }
          },
        },
        dataLabels: {
          enabled: false,
        },
        stroke: {
          curve: "smooth",
        },
        fill: {
          type: 'gradient',
          gradient: {
            shadeIntensity: 1,
            inverseColors: false,
            opacityFrom: 0.5,
            opacityTo: 0,
            stops: [0, 90, 100]
          },
        },
        labels: this.pool_hourly_data.map((e) => e.time),
        xaxis: {
          labels: {
            formatter: function (val) {
              return moment(val).format("MMM Do ha");
            }
          },
          type: "datetime",
        },
        legend: {
          horizontalAlign: "left",
          labels: {
            color: ["#fff"]
          },
          show: false
        },
        theme: {
          palette: "palette1"
        },
        background: "transparent",
        grid: {
          show: false
        }
      }
    }
  },
  async setup(props) {
    let result = await client.request(poolquery, {
      address: props.address,
    });
    return {
      numeral,
      ...result,
    };
  },
});
</script>
<style lang="css">
.apexcharts-text {
  fill: #fff;
}
.apexcharts-tooltip-y-group {
  color: #000 !important;
}
.apexcharts-tooltip-title {
  color: #000 !important;
}
</style>