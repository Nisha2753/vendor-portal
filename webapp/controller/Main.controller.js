sap.ui.define([
  "sap/ui/core/mvc/Controller",
  "sap/m/MessageToast",
  "sap/m/CustomListItem",
  "sap/m/VBox",
  "sap/m/ObjectIdentifier",
  "sap/m/Text"
], function (Controller, MessageToast, CustomListItem, VBox, ObjectIdentifier, Text) {
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
      var data = {
        VENDOR_NAME: this.byId("name").getValue(),
        EMAIL: this.byId("email").getValue(),
        PHONE_NUMBER: this.byId("phone").getValue(),
        GST_NUMBER: this.byId("gst").getValue(),
        PAN_NUMBER: this.byId("pan").getValue(),
        COMPANY_CODE: this.byId("company").getValue(),
        ADDRESS: this.byId("address").getValue()
      };

      var score = 0;

      if (data.GST_NUMBER) {
        score += 40;
      }
      if (data.PAN_NUMBER) {
        score += 30;
      }
      if (data.EMAIL && data.EMAIL.includes("@")) {
        score += 30;
      }

      MessageToast.show("Score: " + score + " (Demo)");
      console.log("Onboarding Data:", data);
    },

    onSpeak: function () {
      if ("webkitSpeechRecognition" in window) {
        var rec = new webkitSpeechRecognition();
        var oInput = this.byId("aiInput");

        rec.start();

        rec.onresult = function (e) {
          oInput.setValue(e.results[0][0].transcript);
        };
      } else {
        MessageToast.show("Voice not supported");
      }
    },

    onAsk: function () {
      MessageToast.show("🤖 " + this.byId("aiInput").getValue());
    },

    onLoadVendors: function () {
      var oList = this.byId("vendorList");
      oList.removeAllItems();

      this.byId("mainApp").to(this.byId("listPage"));

      fetch("https://npsap01.namdhariseeds.com:44310/sap/opu/odata/sap/ZVENDOR_ODATA_SRV/VendorSet?$format=json")
        .then(function (res) {
          console.log("HTTP Status:", res.status);
          return res.text();
        })
        .then(function (text) {
          console.log("RAW RESPONSE:", text);

          var data = JSON.parse(text);
          console.log("PARSED DATA:", data);

          var results = (data.d && data.d.results) ? data.d.results : [];
          console.log("RESULTS:", results);

          if (!results.length) {
            MessageToast.show("No data found from OData");
            return;
          }

          results.forEach(function (v) {
            oList.addItem(new CustomListItem({
              content: new VBox({
                class: "sapUiSmallMargin sapUiSmallMarginBottom",
                items: [
                  new ObjectIdentifier({
                    title: v.VendorName || "No Name",
                    text: "Vendor ID: " + (v.VendorId || "")
                  }),
                  new Text({ text: "Email: " + (v.Email || "") }),
                  new Text({ text: "Phone: " + (v.PhoneNumber || "") }),
                  new Text({ text: "GST: " + (v.GstNumber || "") }),
                  new Text({ text: "PAN: " + (v.PanNumber || "") }),
                  new Text({ text: "Company Code: " + (v.CompanyCode || "") }),
                  new Text({ text: "Address: " + (v.Address || "") }),
                  new Text({ text: "Status: " + (v.Status || "") })
                ]
              })
            }));
          });

          MessageToast.show("✅ Real OData loaded");
        })
        .catch(function (err) {
          console.log("OData fetch failed:", err);
          MessageToast.show("❌ OData failed - check console");
        });
    }

  });
});