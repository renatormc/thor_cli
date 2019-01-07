<template>
  <q-page>
    <q-toolbar color="primary" :glossy="$q.theme === 'mat'" :inverted="$q.theme === 'ios'">
      <q-toolbar-title>Thor</q-toolbar-title>
      <q-btn class="q-mr-sm" flat dense icon="add" @click="add"/>
      <q-btn class="q-mr-sm" flat dense icon="cloud_download" @click="loadData"/>
      <q-btn class="q-mr-sm" flat dense icon="save" @click="save"/>
      <q-btn class="q-mr-sm" flat dense v-if="!encrypted" icon="no_encryption" @click="encrypt"/>
      <q-btn class="q-mr-sm" flat dense v-if="encrypted" icon="lock_open" @click="decrypt"/>
    </q-toolbar>
    <div class="row">
      <div class="col">
        <q-input class="q-ma-md" v-model="serverpass" type="password"/>
        <q-input class="q-ma-md" v-model="pass" type="password"/>
      </div>
    </div>

    <div class="row">
      <div class="col">
        <q-list highlight>
          <q-item v-for="(item, index) in items" :key="index">
            <q-item-main :label="item.name" :sublabel="sublabel(index)"/>
            <q-btn color="primary" flat icon="delete" @click="deleteItem(index)"/>
            <q-btn color="primary" flat icon="bubble_chart" @click="revelItem(index)"/>
            <q-btn color="primary" flat icon="edit" @click="editItem(index)"/>
          </q-item>
        </q-list>
      </div>
    </div>
    <div class="row">
      <div class="col">
        <q-input class="q-ma-md" v-model="nameNew"/>
      </div>
    </div>
    <div class="row">
      <div class="col">
        <q-input class="q-ma-md" v-model="passNew" type="password"/>
      </div>
    </div>
  </q-page>
</template>

<style>
</style>

<script>
var CryptoJS = require("crypto-js");
export default {
  name: "PageIndex",
  data() {
    return {
      passNew: "",
      nameNew: "",
      items: [],
      reveled: "",
      encrypted: true,
      editingIndex: null,
      pass: "",
      serverpass: ""
    };
  },
  methods: {
    loadData() {
      this.nameNew = "";
      this.passNew = "";
      this.$axios
        .get("data", { headers: { serverthor: this.serverpass } })
        .then(response => {
          console.log(response.data);
          var items = response.data["data"];
          for (var i = 0; i < items.length; i++) {
            items[i]["reveled"] = false;
          }
          this.items = items;
        })
        .catch(error => {
          console.log(error);
          this.$q.notify({
            color: "negative",
            position: "top",
            message: "Loading failed",
            icon: "report_problem"
          });
        });
    },
    save() {
      this.nameNew = "";
      this.passNew = "";
      if (!this.encrypted) {
        this.encrypt();
      }
      this.$axios
        .post(
          "data",
          { data: this.items },
          { headers: { serverthor: this.serverpass } }
        )
        .then(response => {
          console.log(response.data);
          this.items = [];
          this.pass = "";
        })
        .catch(() => {
          this.$q.notify({
            color: "negative",
            position: "top",
            message: "Save failed",
            icon: "report_problem"
          });
        });
    },
    encrypt() {
      for (var i = 0; i < this.items.length; i++) {
        this.items[i].name = CryptoJS.AES.encrypt(
          this.items[i].name,
          this.pass
        ).toString();
        this.items[i].thor = CryptoJS.AES.encrypt(
          this.items[i].thor,
          this.pass
        ).toString();
      }
      this.encrypted = true;
    },
    decrypt() {
      for (var i = 0; i < this.items.length; i++) {
        this.items[i].name = CryptoJS.AES.decrypt(
          this.items[i].name,
          this.pass
        ).toString(CryptoJS.enc.Utf8);
        this.items[i].thor = CryptoJS.AES.decrypt(
          this.items[i].thor,
          this.pass
        ).toString(CryptoJS.enc.Utf8);
      }
      this.encrypted = false;
      this.sort();
    },

    add() {
      if (this.nameNew != "" && this.passNew != "") {
        if (this.editingIndex != null) {
          this.items[this.editingIndex].name = this.nameNew;
          this.items[this.editingIndex].thor = this.passNew;
          this.editingIndex = null;
          return;
        }
        self = this;
        var alreadExists = this.items.filter(function(elem, i, array) {
          return elem.name == self.nameNew;
        });
        if (alreadExists.length > 0) {
          this.$q
            .dialog({
              title: "Replace",
              message: "Replace it?",
              ok: "Agree",
              cancel: "Disagree"
            })
            .then(() => {})
            .catch(() => {
              return;
            });
        }
        this.items.push({
          name: this.nameNew,
          thor: this.passNew,
          reveled: false
        });
        if (this.encrypted) {
          var pos = this.items.length - 1;
          this.items[pos].name = CryptoJS.AES.encrypt(
            this.items[pos].name,
            this.pass
          ).toString();
          this.items[pos].thor = CryptoJS.AES.encrypt(
            this.items[pos].thor,
            this.pass
          ).toString();
        }
        this.nameNew = "";
        this.passNew = "";
        this.sort()
      }
    },
    deleteItem(index) {
      this.items.splice(index, 1);
    },
    revelItem(index) {
      this.items[index].reveled = !this.items[index].reveled;
    },
    editItem(index) {
      this.nameNew = this.items[index].name;
      this.passNew = this.items[index].thor;
      this.editingIndex = index;
    },
    sublabel(index) {
      if (this.items[index].reveled) {
        return this.items[index].thor;
      }
      return "";
    },
    sort() {
      console.log("ordenando");
      // this.items = _.orderBy(this.items, 'name', 'asc');
      this.items = this.items.sort((a, b) => {
        if (a.name.toLowerCase() > b.name.toLowerCase()) {
          return 1;
        } else {
          return -1;
        }
      });
    }
  }
};
</script>
