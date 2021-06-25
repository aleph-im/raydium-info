<template>
  <events-table :events="events" />
</template>

<script>
import { defineComponent } from 'vue'
import EventsTable from './EventsTable.vue'
import poolhistoryquery from '../queries/pool_history.gql'
import { client } from "../services/graphql"

export default defineComponent({
  components: { EventsTable },
  props: {
    address: String
  },
  async setup(props) {
    let result = await client.request(poolhistoryquery, {
      address: props.address,
    });
    return {
      ...result,
    }
  },
})
</script>
