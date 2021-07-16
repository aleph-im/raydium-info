
<template>
  <q-page class="q-pa-xl">
    <div class="bg-raydium-gradient rounded-borders q-pa-one">
      <q-table
        title="Pools"
        :rows="displayed_pools"
        :columns="poolcols"
        row-key="name"
        :pagination="{rowsPerPage: 25}"
        class="bg-dark-opacity"
      >
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
                {{ props.row.name }}
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
import { client } from '../services/graphql'
import { get_token } from '../services/tokens'
import numeral from "numeral"
import moment from "moment"

export default defineComponent({
  name: 'IndexPage',
  computed: {
    displayed_pools() {
      return this.pools.filter((pool) => pool.version > 2).map((pool) => ({
        ...pool,
        coin: get_token(pool.coin.address, pool.coin),
        pc: get_token(pool.pc.address, pool.pc),
        tvl: pool.stats.tvl_usd,
        vol24h: pool.stats.vol24h_usd,
      })).sort((a, b) => (
        a.tvl < b.tvl
      ))
    }
  },
  async setup() {
    let result = await client.request(poolquery)
    console.log(result)

    return {
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
