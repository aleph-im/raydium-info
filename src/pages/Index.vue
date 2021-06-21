
<template>
  <q-page class="q-pa-md">

      <q-table
        title="Pools"
        :rows="displayed_pools"
        :columns="poolcols"
        row-key="name"
        :pagination="{rowsPerPage: 25}"
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
              {{ props.row.tvl }}
            </q-td>
            <q-td key="vol24h" :props="props">
              {{ props.row.vol24h }}
            </q-td>
            <q-td key="vol7d" :props="props">
              {{ props.row.vol7d }}
            </q-td>
          </q-tr>
        </template>
      </q-table>
  </q-page>
</template>

<script>
import { defineComponent } from 'vue'

import poolquery from '../queries/pools.gql'
import { client } from '../services/graphql'

export default defineComponent({
  name: 'IndexPage',
  computed: {
    displayed_pools() {
      console.log(this.pools)
      console.log( this.pools.filter((pool) => pool.version > 2))
      return this.pools.filter((pool) => pool.version > 2)
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
          align: 'left'
        },
        {
          'name': 'tvl',
          'label': 'TVL',
          'field': 'tvl'
        },
        {
          'name': 'vol24h',
          'label': 'Volume (24h)',
          'field': 'vol24h'
        },
        {
          'name': 'vol7d',
          'label': 'Volume (7d)',
          'field': 'vol7d'
        }
      ]
    }
  }

})
</script>
