<template>
  <q-page>
    <h4>
      <q-avatar>
        <img :src="pool.coin.logoURI">
      </q-avatar>
      <q-avatar style="margin-left: -12px">
        <img :src="pool.pc.logoURI">
      </q-avatar>
      {{ pool.coin.symbol }}-{{ pool.pc.symbol }} Pool
    </h4>
    <events-table :events="events" />
  </q-page>
</template>


<script>
import { defineComponent } from 'vue'

import poolquery from '../queries/pool_detail.gql'
import { client } from '../services/graphql'
import numeral from "numeral"
import moment from "moment"
import EventsTable from 'src/components/EventsTable.vue'

export default defineComponent({
  components: { EventsTable },
  name: 'PoolPage',
  props: {
    address: String
  },
  async setup(props) {
    let result = await client.request(poolquery,
    {
      address: props.address
    })
    return {
      ...result
    }
  }
})
</script>