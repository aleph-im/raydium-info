
<template>
  <q-page class="">

      <q-table
        title="Pools"
        :rows="pools"
        :columns="poolcols"
        row-key="name"
      >
        <template v-slot:body="props">
          <q-tr :props="props">
            <q-td key="name" :props="props">
              <router-link :to="{ name: 'pool', params: { ammId: props.row.ammId }}">
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
import axios from "axios"

export default defineComponent({
  name: 'IndexPage',
  async setup() {
    let result = await axios({
        method: "POST",
        url: "http://localhost:8080",
        data: {
            query: `
                {
                    pools {
                        ammId,
                        name
                    }
                }
            `
        }
    });

    return {
      pools: result.data.data.pools,
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
