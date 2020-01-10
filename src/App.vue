<template>
  <v-app>
    <v-app-bar app>
      <v-toolbar-title class="headline text-uppercase">
        <span>Mini </span>
        <span class="font-weight-light">Hotel Search</span>
      </v-toolbar-title>
      <v-spacer></v-spacer>
      <v-btn
        text
        href="http://chiengfa.com"
        target="_blank"
      >
        <span class="mr-2">Portfolio</span>
      </v-btn>
    </v-app-bar>

    <v-container>
        <v-alert  type="info" transition="scale-transition" class="mt-4">
            {{ status }}
        </v-alert>
        <v-row>
            <v-col cols="12" lg="4">
                <v-select :items="continents" item-text="name" item-value="id" 
                          label="Region" v-model="continent" v-on:change="getCountries">
                </v-select>
            </v-col>
            <v-col cols="12" lg="4" v-if="haveRgn">
              <v-autocomplete
                :items="countries"
                item-text="name"
                item-value="id"
                label="Country"
                v-model="country" v-on:change="getCities"
              >
              </v-autocomplete>
            </v-col>
            <v-col cols="12" lg="4" v-if="haveCntry">
              <v-autocomplete
                :items="cities"
                item-text="name"
                item-value="id"
                label="City"
                v-model="city" v-on:change="fetchHotels"
              >
              </v-autocomplete>
            </v-col>
        </v-row>
        <v-row v-if="haveHots">
            <v-col cols="12" lg="4">
              <v-menu
                v-model="menu"
                :close-on-content-click="false"
                full-width
                min-width="290px"
              >
                <template v-slot:activator="{ on }">
                  <v-text-field
                    :value="dateFormatted"
                    label="Check-in Date"
                    prepend-icon="mdi-calendar"
                    readonly
                    v-on="on"
                  ></v-text-field>
                </template>
                <v-date-picker v-model="dateIn" no-title scrollable
                    @change="menu = false">
                </v-date-picker>
              </v-menu>
            </v-col>
            <v-col cols="12" lg="4">
              <v-menu
                v-model="menu2"
                :close-on-content-click="false"
                full-width
                min-width="290px"
              >
                <template v-slot:activator="{ on }">
                  <v-text-field
                    :value="outFormatted"
                    label="Check-out Date"
                    prepend-icon="mdi-calendar"
                    readonly
                    v-on="on"
                  ></v-text-field>
                </template>
                <v-date-picker v-model="dateOut" no-title scrollable @change="menu2 = false">
                </v-date-picker>
              </v-menu>
            </v-col>
            <v-col cols="8" lg="3">
                <v-rating v-model="minStars"></v-rating>
            </v-col>
            <v-col cols="4" lg="1">
                <v-btn color="info" @click="fetchHotels">Update</v-btn>
            </v-col>
         </v-row>
        <v-row>
              <v-col cols="12" lg="4" v-for="hotel in hotels" :key="hotel.hotelId">
                <v-card color="white">
                  <v-card-text>
                      <v-layout>
                          <v-flex xs12>
                              <a :href="hotel.landingURL" target="_blank">
                              <img :src="hotel.imageURL" class="hotelImg"></a>
                              <h2>{{ hotel.hotelName }}</h2>

                              <p><span v-html="starz(hotel.starRating)"></span></p>
                              <p>Starting from: ${{ hotel.dailyRate }} 
                                  <v-icon v-if="hotel.includeBreakfast == true">mdi-silverware-fork-knife</v-icon> &nbsp;
                                  <v-icon v-if="hotel.freeWifi == true" color="green">mdi-wifi</v-icon>
                              </p>Customer rating: {{ hotel.reviewScore }} &nbsp; 
                              <a :href="hotel.landingURL" target="_blank">More details / booking <v-icon color="primary">mdi-chevron-double-right</v-icon></a><p>
                              </p>
                          </v-flex>
                      </v-layout>
                  </v-card-text>
              </v-card>
            </v-col>
        </v-row>
    </v-container>
    <v-footer
      class="font-weight-medium mt-8"
    >
      <v-col
        class="text-center primary white--text"
        cols="12"
      >
        &copy; {{ new Date().getFullYear() }} — <strong>Michael Holland</strong>
      </v-col>
    </v-footer>
  </v-app>
</template>

<script>
import {fireDb} from './plugins/firebase'
import axios from 'axios'
import moment from 'moment'

export default {
  name: 'App',
  data: () => ({
      continents: [
        { id: 1, name: "Africa" },
        { id: 2, name: "Asia" },
        { id: 3, name: "Central America & Caribbean" },
        { id: 4, name: "Europe" },
        { id: 5, name: "Middle East" },
        { id: 6, name: "North America" },
        { id: 7, name: "Pacific Ocean & Australia" },
        { id: 8, name: "South America" },
      ],
      continent: 0,
      countries: [],
      haveCntry: false,
      haveRgn: false,
      country: 0,
      cities: [],
      city: 0,
      dateIn: moment().add(30, 'days').format().substr(0, 10),
      dateOut: moment().add(33, 'days').format().substr(0, 10),
      dateFormatted: moment().add(30, 'days').calendar(),
      outFormatted: moment().add(33, 'days').calendar(),
      menu1: false,
      minStars: 0,
      hotels: [],
      date: new Date().toISOString().substr(0, 10),
      menu: false,
      modal: false,
      menu2: false,
      haveHots: false,
      status: 'Welcome to the hotel search web app. Start by picking a region'
  }),
  watch: {
    dateIn () {
      this.dateFormatted = this.formatDate(this.dateIn)
      this.dateOut = moment(this.dateFormatted).add(3, 'days').format().substr(0, 10)
      this.minOut = moment(this.dateFormatted).add(1, 'days').format().substr(0, 10)
    },
    dateOut () {
      this.outFormatted = this.formatDate(this.dateOut)
    }
  },
  methods: {
    starz (rating) {
      var fstar = '<span class="mdi mdi-star" aria-hidden="true"></span>'
      var nstar = '<span class="mdi mdi-star-border" aria-hidden="true"></span>'
      var hstar = '<span class="mdi mdi-star-half" aria-hidden="true"></span>'
      var stars = ''
      for (var is = 0; is < 5; is++) {
        if (rating > is && rating < (is + 1)) {
          stars += hstar
        } else if (rating > is) {
          stars += fstar
        } else {
          stars += nstar
        }
      }
      return stars
    },
    formatDate (date) {
      if (!date) return null

      const [year, month, day] = date.split('-')
      return `${month}/${day}/${year}`
    },
    parseDate (date) {
      if (!date) return null

      const [month, day, year] = date.split('/')
      return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`
    },
      getCountries () {
          fireDb.collection('countries').where('continent', '==', this.continent).get()
            .then(snapshot => {
              var tmpC = []
              snapshot.forEach(doc => {
                  tmpC.push({ id: doc.data().id, name: doc.id })
              })
              this.countries = tmpC
              this.haveRgn = true
              this.status = "Now pick a country in that region"
          })
      },
      getCities () {
          fireDb.collection('cities').where('country', '==', this.country).orderBy('name').get()
            .then(snapshot => {
              var tmpC = []
              snapshot.forEach(doc => {
                  tmpC.push({ id: doc.id, name: doc.data().name })
              })
              this.cities = tmpC
              this.haveCntry = true
              this.status = "Lastly, pick a city where you plan to stay"
          })
      },
      fetchHotels () {
          var params = { city: this.city, checkin: this.dateIn, checkout: this.dateOut, minstars: this.minStars }
            // eslint-disable-next-line
            // console.log(this.minStars)
          axios
              .post('https://us-central1-hotels-8fb5d.cloudfunctions.net/hotels', params)
              .then(response => {
                this.hotels = response.data.results
                this.haveHots = true
                this.status = "Done! See the top picks for your city below. You can refine your search by selecting dates."
                // eslint-disable-next-line
                //console.log(response.data)
              })
              .catch(error => {
              // eslint-disable-next-line
                console.log(error)
              // eslint-disable-next-line
                console.log(error.request)
              // eslint-disable-next-line
                console.log(error.data)
              // eslint-disable-next-line
                console.log(error.headers)
            })
      }
  }
}
</script>

<style>
    .hotelImg { width: 100%; }
    a { font-weight: bold; text-decoration: none; }
    p { margin-bottom: 0.5em; }
#app {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #2c3e50;
  margin-top: 60px;
}
</style>
