<template>
  <div class="q-pa-md q-gutter-sm" v-if="synced == false">
    <q-banner inline-actions rounded class="text-white">
      <q-icon name="warning" class="text-red" style="font-size: 1.2rem;" />
      indexing in progress, data is not 100% accurate.
    </q-banner>
  </div>
  <q-page class="q-pa-xl">
    <div class="row q-col-gutter-md q-mb-md">
      <div class="col-12 col-md-6">
        <q-card class="bg-raydium-gradient q-pa-one">
          <q-card-section class="bg-dark-opacity">
            <h6 class="q-ma-none">TVL</h6>
            <p class="text-h5 q-my-md text-center">{{ numeral(tvl_usd).format("0,0 $") }}</p>
          </q-card-section>
        </q-card>
      </div>
      <div class="col-12 col-md-6">
        <q-card class="bg-raydium-gradient q-pa-one">
          <q-card-section class="bg-dark-opacity">
            <h6 class="q-ma-none">24h Volume</h6>
            <p class="text-h5 q-my-md text-center">{{ numeral(vol24h_usd).format("0,0 $") }}</p>
          </q-card-section>
        </q-card>
      </div>
    </div>
    <div class="bg-raydium-gradient rounded-borders q-pa-one">
      <q-table
        title="Pools"
        :rows="displayed_pools"
        :columns="poolcols"
        row-key="name"
        :pagination="{
          rowsPerPage: 25,
          sortBy: 'tvl',
          descending: true
        }"
        :filter="filter"
        class="bg-dark-opacity"
      >
        <template v-slot:top-right>
          <q-input borderless dense debounce="300" v-model="filter" placeholder="Search">
            <template v-slot:append>
              <q-icon name="search" />
            </template>
          </q-input>
        </template>
        <template v-slot:body="props">
          <q-tr :props="props">
            <q-td key="name" :props="props" class="text-white">
              <router-link :to="{ name: 'pool', params: { address: props.row.ammId }}"  class="text-white text-bold">
              <q-avatar size="xs">
                <img :src="props.row.coin.logoURI">
              </q-avatar>
              <q-avatar size="xs">
                <img :src="props.row.pc.logoURI">
              </q-avatar>
                {{ props.row.coin.symbol }}-{{ props.row.pc.symbol }}
                <q-tooltip>
                  {{ props.row.coin.name }} / {{ props.row.pc.name }}
                </q-tooltip>
              <img v-if="props.row.serumProgramId == 'srmqPvymJeFKQ4zGQed1GFppgkRHL9kaELCbyksJtPX'" src="../assets/open-book.svg" alt="OpenBook" align="center"/>
              </router-link>
            </q-td>
            <q-td key="tvl" :props="props">
              {{ numeral(props.row.tvl).format("0,0 $") }}
            </q-td>
            <q-td key="vol24h" :props="props">
              {{ numeral(props.row.vol24h).format("0,0 $") }}
            </q-td>
          </q-tr>
        </template>
      </q-table>
    </div>
  </q-page>
</template>

<script>
import { defineComponent } from 'vue'

import poolquery from '../queries/pools.gql'
import statequery from '../queries/state.gql'
import { client } from '../services/graphql'
import { get_token } from '../services/tokens'
import numeral from "numeral"
import moment from "moment"

export default defineComponent({
  name: 'IndexPage',
  data() {
    return {
      'filter': ''
    }
  },
  computed: {
    displayed_pools() {
      return this.pools.map((pool) => ({
        ...pool,
        coin: get_token(pool.coin.address, pool.coin),
        pc: get_token(pool.pc.address, pool.pc),
        tvl: pool.stats.tvl_usd,
        vol24h: pool.stats.vol24h_usd,
      })).sort((a, b) => (
        a.tvl < b.tvl
      ))
    },
    vol24h_usd() {
      return this.pools.reduce((v0, v1) => (v0 + v1.stats.vol24h_usd), 0)
    },
    tvl_usd() {
      return this.pools.reduce((v0, v1) => (v0 + v1.stats.tvl_usd), 0)
    }
  },
  async setup() {
    let state = await client.request(statequery);
    let synced = true;
    let timeDiff = (+new Date()/1000) - state.status.last_blockTime;
    if(state.status.state !== "OK" || timeDiff > 600) {
      synced = false
    }
    let result = await client.request(poolquery)
    return {
      synced: synced,
      pools: result.pools,
      poolcols: [
        {
          name: 'name',
          label: 'Pool name',
          field: 'name',
          align: 'left',
          sortable: true
        },
        {
          'name': 'tvl',
          'label': 'TVL',
          'field': 'tvl',
          sortable: true
        },
        {
          'name': 'vol24h',
          'label': 'Volume (24h)',
          'field': 'vol24h',
          sortable: true
        }
      ],
      numeral: numeral
    }
  }

})
</script>
