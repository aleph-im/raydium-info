<template>
  <div class="q-pa-md q-gutter-sm" v-if="synced == false">
    <q-banner inline-actions rounded class="text-white">
      <q-icon name="warning" class="text-red" style="font-size: 1.2rem;" />
      indexing in progress, data is not 100% accurate.
    </q-banner>
  </div>
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
      <div class="row q-gutter-sm" v-if="pool.stats.price !== null">
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
        <q-btn color="card" label="Add liquidity" type="a" :href="`https://raydium.io/liquidity/?ammId=${pool.ammId}`" target="_blank" rel="noopener" />
        <q-btn color="primary" label="Swap" type="a" :href="`https://raydium.io/swap/?ammId=${pool.ammId}`" target="_blank" rel="noopener" />
      </div>
    </div>
    <div class="flex q-gutter-md q-mb-md items-stretch">
      <q-card class="bg-card col-auto" style="min-width: 300px">
        <q-card-section>

          <div class="bg-raydium-gradient rounded-borders q-pa-one">
            <q-card class="shadow-0 bg-dark-opacity">
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
          </div>
          <p class="q-pt-md text-bold q-mb-none">TVL</p>
          <p class="text-h5">
            {{ numeral(pool.stats.tvl_usd).format("0,0 $") }}
          </p>
          <p class="q-pt-md text-bold q-mb-none">Volume (24h)</p>
          <p class="text-h5">
            {{ numeral(pool.stats.vol24h_usd).format("0,0 $") }}
          </p>
        </q-card-section>
      </q-card>
      <div class="col-grow"  v-if="pool_hourly_data">
        <q-card class="bg-card">
          <q-tabs
            v-model="chartTab"
            dense
            class="text-grey"
            active-color="white"
            align="right"
            narrow-indicator
            indicator-color="raydium-purple"
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
    <suspense>
      <template #default>
        <events-history :address="address" />
      </template>
      <template #fallback>
        <div class="flex flex-center">
          <q-spinner-pie
            color="white"
            size="4em"
          />
        </div>
      </template>
    </suspense>
  </q-page>
</template>


<script>
import { defineComponent } from "vue"

import poolquery from "../queries/pool_detail.gql"
import statequery from '../queries/state.gql'
import { client } from "../services/graphql"
import { get_token } from '../services/tokens'
import numeral from "numeral";
import moment from "moment";
import EventsTable from "src/components/EventsTable.vue";
import EventsHistory from "src/components/EventsHistory.vue";

export default defineComponent({
  components: { EventsTable, EventsHistory },
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
        if (point.price_usd !== null) {
          last_value = point.price_usd
        } else if (point.price !== null) {
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
          data: this.pool_hourly_data.map((m) => m.volume_usd),
        },
      ]
    },
    tvlSeries() {
      let values = []
      let last_value = null
      const USDs = ["USD", "CASH", "PAI"]
      let has_usd = USDs.some(symbol => this.pool.pc.symbol.includes(symbol))
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
      const USDs = ["USD", "CASH", "PAI"]
      let has_usd = USDs.some(symbol => this.pool.pc.symbol.includes(symbol))
      let tvl_format = "0,0 $"
      if (!has_usd) {
        tvl_format = `0,0 ${this.pool.coin.symbol}`
      }
      return {
        yaxis: {
          labels: {
            formatter: function (val) {
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
          animations: {
            enabled: false
          }
        },
        dataLabels: {
          enabled: false,
        },
        stroke: {
          curve: "smooth",
          width: 2
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
              return moment(val).format("MMM Do ha m");
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
    let state = await client.request(statequery);
    let synced = true;
    let timeDiff = (+new Date()/1000) - state.status.last_blockTime;
    if(state.status.state !== "OK" || timeDiff > 600) {
      synced = false
    }

    let result = await client.request(poolquery, {
      address: props.address,
    });

    const squash_ts_to = (d, timeframe) => {
      let ms = 1000 * 60 * timeframe;
      let roundedDate = new Date(Math.ceil(d.getTime() / ms) * ms); // close time
      return roundedDate.toISOString();
    }

    const squashTimeframe = (
      result.pool_hourly_data.length > 20
      && (
        squash_ts_to(new Date(result.pool_hourly_data[0].time), 15) != result.pool_hourly_data[0].time
          || squash_ts_to(new Date(result.pool_hourly_data[1].time), 15) != result.pool_hourly_data[1].time
          || squash_ts_to(new Date(result.pool_hourly_data[2].time), 15) != result.pool_hourly_data[2].time
      )
    ) ? true : false;

    // if timeframe less than 15min
    if(squashTimeframe) {
      const history = {};
      // Aggregate data to each 15min if needed
      result.pool_hourly_data.map((current, index, arrRef) => {
		    const time = squash_ts_to(new Date(current.time), 15)
        if(history[time]) {
          history[time].index = index
          history[time].time = time
          history[time].usd_price = current.usd_price;
          history[time].tvl_coin += current.tvl_coin;
          history[time].tvl_pc += current.tvl_pc;
          history[time].tvl_usd += current.tvl_usd;
          history[time].volume += current.volume;
          if(current.time > arrRef[history[time].index].time) {
            history[time].price = current.price;
          }
        } else {
          history[time] = current
          history[time].index = index
        }
      })
      result.pool_hourly_data = Object.values(history)
    }
    result.pool.coin = get_token(result.pool.coin.address, result.pool.coin)
    result.pool.pc = get_token(result.pool.pc.address, result.pool.pc)
    return {
      synced: synced,
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
.apexcharts-menu {
  color: #000 !important;
}
</style>
