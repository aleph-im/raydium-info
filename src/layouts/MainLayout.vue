<template>
  <q-layout view="lhh LpR lff">
    <q-header :class="($q.dark.isActive?'text-white':'text-black') + ' bg-transparent q-pa-sm'">
      <q-toolbar>
        <router-link to="/">
          <img src="../assets/raydium-logo-analytics.svg" height="50" class="q-mr-md" />
        </router-link>
        <q-tabs indicator-color="raydium-purple">
          <q-route-tab
            to="/"
            label="Dashboard"
            exact
          />
        </q-tabs>
        <q-space />
        <img src="../assets/aleph-logo-powered.svg" height="30"/>
      </q-toolbar>
    </q-header>

    <q-page-container class="content">
      <template #default>
        <router-view />
      </template>
      <template #fallback>
        <span>Loading!</span>
      </template>
    </q-page-container>
  </q-layout>
</template>

<script>

import { defineComponent, ref, onErrorCaptured } from 'vue'

export default defineComponent({
  name: 'MainLayout',

  components: {
  },

  async setup () {
    const leftDrawerOpen = ref(false)

    return {
    }
  }
})
</script>

<style lang="scss">
.logo {
  .q-badge {
    position: absolute;
    margin-top: -0.2rem;
    margin-left: -1rem;
  }
}

.q-drawer {
  background: $light-grey;

  .q-separator.q-separator--horizontal {
    width: auto;
    margin: 0 16px;
  }
}

.q-list.menu {
  .q-item {
      min-height: 36px;
      padding-bottom: 0;
      padding-top: 0;
  }

  .q-item__label--header {
    font-weight: 700;
    padding-bottom: 0.5em;
    padding-top: 1.5em;
  }
}

.q-drawer--dark {
  background: #172025;

  .q-list.menu {
    .q-item {
      opacity: 0.5;
      color: #F6F8FB;

      &.q-router-link--active {
        color: #fff;
        opacity: 1.0;
      }
    }

    .q-item__label--header {
      color: #FFF;
    }
  }
}

.content {
  max-width: 1440px;
  margin: 0 auto;
  padding: 0 10px;
  word-wrap: normal;

  .title {
    font-size: 3rem;

    @media (max-width: $breakpoint-sm-max) {
      font-size: 4.4vw;
    }
  }

  .menu {
    background: #7a40f2;
    border-radius: 20px !important;
    margin: 10px;
    padding: 10px;
  }
}

#left {
  .q-drawer {
    :first-child {
      border-radius: 15px;
    }
    padding: 5px !important;

    .q-item.q-item--active {
      background: #fff;
      margin-left: 10px;
      padding-right: 10px;
      border-radius: 15px 0 0 15px;

      border-top-right-radius: 0;
      border-bottom-right-radius: 0;

      &:before, &:after{
        box-sizing: content-box;
        content: '';
        position: absolute;
        left: 100%; /* I use this instead of right: 0 to avoid 1px rounding errors */
        margin-left: -15px; /* I use this because I am using left: 100% */
        width: 15px;
        height: 15px;
        border-right: 15px solid #fff ;
        z-index: 10;
      }

      &:before {
        top: -15px;
        border-bottom: 15px solid  #fff;
        border-bottom-right-radius: 30px;
      }

      &:after {
        bottom: -15px;
        border-top: 15px solid  #fff;
        border-top-right-radius: 30px;
      }
    }
  }
}

.rounded-large {
  border-radius: 25px;
}

.rounded-forced {
  border-radius: 10px !important;
}
</style>
