sap.ui.define([
  "sap/ui/core/mvc/Controller",
  "sap/m/MessageToast",
  "sap/m/CustomListItem",
  "sap/m/VBox",
  "sap/m/HBox",
  "sap/m/Text"
], function (Controller, MessageToast, CustomListItem, VBox, HBox, Text) {
  "use strict";

  return Controller.extend("vendorportal.controller.Main", {

    onOpenOnboard: function () {
      this.byId("mainApp").to(this.byId("onboardPage"));
    },

    onOpenAI: function () {
      this.byId("mainApp").to(this.byId("aiPage"));
    },

    onBack: function () {
      this.byId("mainApp").back();
    },

    onRegister: function () {
      var email = this.byId("email").getValue();
      var gst = this.byId("gst").getValue();
      var pan = this.byId("pan").getValue();

      var score = 0;
      if (gst) score += 40;
      if (pan) score += 30;
      if (email && email.includes("@")) score += 30;

      MessageToast.show("Vendor Score: " + score + " / 100");
    },

    onSpeak: function () {
      if ("webkitSpeechRecognition" in window) {
        var rec = new webkitSpeechRecognition();
        var input = this.byId("aiInput");

        rec.start();
        rec.onresult = function (e) {
          input.setValue(e.results[0][0].transcript);
        };
      } else {
        MessageToast.show("Voice not supported");
      }
    },

    onAsk: function () {
      var q = this.byId("aiInput").getValue();
      MessageToast.show("AI Response: " + q);
    },

    /* 🔥 Helper functions */

    _getInitials: function (name) {
      if (!name) return "V";
      var parts = name.split(" ");
      return parts.map(p => p[0]).join("").toUpperCase();
    },

    _box: function (label, value) {
      return new VBox({
        class: "vendorDetailBox",
        items: [
          new Text({ text: label, class: "vendorLabel" }),
          new Text({ text: value || "-", class: "vendorValue" })
        ]
      });
    },

    _addVendorCard: function (v) {
      var list = this.byId("vendorList");
      var initials = this._getInitials(v.VendorName);

      list.addItem(new CustomListItem({
        content: new VBox({
          class: "vendorCard",
          items: [

            new HBox({
              class: "vendorHeader",
              justifyContent: "SpaceBetween",
              alignItems: "Center",
              items: [
                new HBox({
                  alignItems: "Center",
                  items: [
                    new Text({
                      text: initials,
                      class: "vendorAvatar"
                    }),
                    new VBox({
                      items: [
                        new Text({
                          text: v.VendorName || "No Name",
                          class: "vendorName"
                        }),
                        new Text({
                          text: "Vendor ID: " + (v.VendorId || "-") + " • " + (v.Email || "-"),
                          class: "vendorMeta"
                        })
                      ]
                    })
                  ]
                }),

                new Text({
                  text: "Status: " + (v.Status || "Demo"),
                  class: "vendorChip"
                })
              ]
            }),

            new VBox({
              class: "vendorDetailsGrid",
              items: [
                this._box("Phone", v.PhoneNumber),
                this._box("GST Number", v.GstNumber),
                this._box("PAN Number", v.PanNumber),
                this._box("Company Code", v.CompanyCode),
                this._box("Address", v.Address)
              ]
            })

          ]
        })
      }));
    },

    onLoadVendors: function () {
      var list = this.byId("vendorList");
      var that = this;

      list.removeAllItems();
      this.byId("mainApp").to(this.byId("listPage"));

      fetch("https://npsap01.namdhariseeds.com:44310/sap/opu/odata/sap/ZVENDOR_ODATA_SRV/VendorSet?$format=json")
        .then(function (res) {
          return res.json();
        })
        .then(function (data) {
          var results = (data.d && data.d.results) ? data.d.results : [];

          if (!results.length) {
            MessageToast.show("No OData records found");
            return;
          }

          results.forEach(function (v) {
            that._addVendorCard(v);
          });

          MessageToast.show("Real OData loaded");
        })
        .catch(function () {

          var demoData = [
            {
              VendorId: "1",
              VendorName: "Harsh Singh",
              Email: "harshsinghop3@gmail.com",
              PhoneNumber: "9999999999",
              GstNumber: "123456789098765",
              PanNumber: "PV1234AB",
              CompanyCode: "100",
              Address: "Noida",
              Status: "A"
            },
            {
              VendorId: "2",
              VendorName: "Himanshu Singh",
              Email: "himanshusingh@gmail.com",
              PhoneNumber: "8888899999",
              GstNumber: "123456789098765",
              PanNumber: "PV1234AB",
              CompanyCode: "100",
              Address: "Delhi",
              Status: "A"
            }
          ];

          demoData.forEach(function (v) {
            that._addVendorCard(v);
          });

          MessageToast.show("OData blocked, showing demo data");
        });
    }

  });
});
