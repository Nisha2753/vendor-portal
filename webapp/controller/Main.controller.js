// sap.ui.define([
//   "sap/ui/core/mvc/Controller",
//   "sap/m/MessageToast",
//   "sap/m/MessageBox",
//   "sap/m/CustomListItem",
//   "sap/m/VBox",
//   "sap/m/HBox",
//   "sap/m/Text",
//   "sap/m/Button",
//   "sap/ui/core/BusyIndicator"
// ], function (Controller, MessageToast, MessageBox, CustomListItem, VBox, HBox, Text, Button, BusyIndicator) {
//   "use strict";

//   var BASE_URL = "/sap/opu/odata/sap/ZVENDOR_ODATA_SRV";

//   return Controller.extend("vendorportal.controller.Main", {

//     onLogin: function () {
//       var email = this.byId("loginEmail").getValue().trim();
//       var password = this.byId("loginPassword").getValue().trim();

//       if (email !== "nishsingh61746@gmail.com") {
//         MessageBox.error("Access denied.");
//         return;
//       }

//       if (!password) {
//         MessageBox.error("Enter password");
//         return;
//       }

//       MessageToast.show("Login success");
//       this.byId("mainApp").to(this.byId("homePage"));
//     },

//     onOpenOnboard: function () {
//       this.byId("mainApp").to(this.byId("onboardPage"));
//     },

//     onOpenAI: function () {
//       this.byId("mainApp").to(this.byId("aiPage"));
//     },

//     onBack: function () {
//       this.byId("mainApp").back();
//     },

//     onRegister: function () {
//       var that = this;

//       var payload = {
//         VendorId: "",
//         VendorName: this.byId("name").getValue().trim(),
//         Email: this.byId("email").getValue().trim(),
//         PhoneNumber: this.byId("phone").getValue().trim(),
//         GstNumber: this.byId("gst").getValue().trim(),
//         PanNumber: this.byId("pan").getValue().trim(),
//         CompanyCode: this.byId("company").getValue().trim(),
//         Address: this.byId("address").getValue().trim(),
//         Status: "A"
//       };

//       if (!payload.VendorName || !payload.Email) {
//         MessageBox.error("Vendor Name and Email are required.");
//         return;
//       }

//       BusyIndicator.show(0);

//       fetch(BASE_URL + "/VendorSet?$top=1&$format=json", {
//         method: "GET",
//         credentials: "include",
//         headers: {
//           "Accept": "application/json",
//           "X-CSRF-Token": "Fetch"
//         }
//       })
//         .then(function (res) {
//           var token = res.headers.get("x-csrf-token");

//           if (!token) {
//             throw new Error("No CSRF token");
//           }

//           return fetch(BASE_URL + "/VendorSet", {
//             method: "POST",
//             credentials: "include",
//             headers: {
//               "Content-Type": "application/json",
//               "Accept": "application/json",
//               "X-CSRF-Token": token
//             },
//             body: JSON.stringify(payload)
//           });
//         })
//         .then(function (res) {
//           if (res.ok || res.status === 201) {
//             BusyIndicator.hide();
//             MessageBox.success("✅ Vendor Registered Successfully");

//             ["name", "email", "phone", "gst", "pan", "company", "address"].forEach(function (id) {
//               that.byId(id).setValue("");
//             });

//             return;
//           }

//           return res.text().then(function (text) {
//             BusyIndicator.hide();
//             console.error("POST failed response:", text);
//             MessageBox.error("❌ POST Failed " + res.status + "\nCheck console for SAP error.");
//           });
//         })
//         .catch(function (err) {
//           BusyIndicator.hide();
//           console.error("POST error:", err);
//           MessageBox.error("⚠️ " + err.message);
//         });
//     },

//     onLoadVendors: function () {
//       var list = this.byId("vendorList");
//       var that = this;

//       list.removeAllItems();
//       this.byId("mainApp").to(this.byId("listPage"));
//       BusyIndicator.show(0);

//       fetch(BASE_URL + "/VendorSet?$format=json", {
//         method: "GET",
//         credentials: "include",
//         headers: {
//           "Accept": "application/json"
//         }
//       })
//         .then(function (res) {
//           if (!res.ok) {
//             throw new Error("GET Failed " + res.status);
//           }
//           return res.json();
//         })
//         .then(function (data) {
//           BusyIndicator.hide();

//           var results = data.d && data.d.results ? data.d.results : [];

//           that._addTableHeader();

//           results.forEach(function (v) {
//             that._addVendorRow(v);
//           });

//           MessageToast.show("✅ " + results.length + " vendors loaded");
//         })
//         .catch(function (err) {
//           BusyIndicator.hide();
//           console.error("GET error:", err);
//           MessageToast.show("Error loading data");
//         });
//     },

//     _getInitials: function (name) {
//       if (!name) {
//         return "V";
//       }

//       return name
//         .split(" ")
//         .map(function (word) {
//           return word.charAt(0);
//         })
//         .join("")
//         .toUpperCase()
//         .slice(0, 2);
//     },

//     _addTableHeader: function () {
//       var list = this.byId("vendorList");

//       list.addItem(new CustomListItem({
//         content: new HBox({
//           class: "vendorTableHeader",
//           items: [
//             new Text({ text: "ID", width: "70px", class: "vendorTableHeadText" }),
//             new Text({ text: "Vendor", width: "230px", class: "vendorTableHeadText" }),
//             new Text({ text: "Email", width: "270px", class: "vendorTableHeadText" }),
//             new Text({ text: "Company Code", width: "150px", class: "vendorTableHeadText" }),
//             new Text({ text: "Status", width: "120px", class: "vendorTableHeadText" }),
//             new Text({ text: "Action", width: "90px", class: "vendorTableHeadText" })
//           ]
//         })
//       }));
//     },

//     _addVendorRow: function (v) {
//       var list = this.byId("vendorList");

//       var statusText = v.Status === "A" ? "Active" : "Inactive";
//       var statusClass = v.Status === "A" ? "statusActive" : "statusInactive";

//       list.addItem(new CustomListItem({
//         content: new HBox({
//           class: "vendorTableRow",
//           alignItems: "Center",
//           items: [
//             new Text({
//               text: "#" + (v.VendorId || "-"),
//               width: "70px",
//               class: "vendorTableCell"
//             }),

//             new HBox({
//               width: "230px",
//               alignItems: "Center",
//               items: [
//                 new Text({
//                   text: this._getInitials(v.VendorName),
//                   class: "vendorSmallAvatar"
//                 }),
//                 new VBox({
//                   items: [
//                     new Text({
//                       text: v.VendorName || "-",
//                       class: "vendorRowName"
//                     }),
//                     new Text({
//                       text: v.PhoneNumber || "-",
//                       class: "vendorRowSub"
//                     })
//                   ]
//                 })
//               ]
//             }),

//             new Text({
//               text: v.Email || "-",
//               width: "270px",
//               class: "vendorTableCell"
//             }),

//             new Text({
//               text: v.CompanyCode || "-",
//               width: "150px",
//               class: "vendorTableCell"
//             }),

//             new Text({
//               text: statusText,
//               width: "120px",
//               class: statusClass
//             }),

//             new Button({
//               text: "View",
//               width: "70px",
//               press: function () {
//                 MessageBox.information(
//                   "Vendor ID: " + (v.VendorId || "-") +
//                   "\nName: " + (v.VendorName || "-") +
//                   "\nEmail: " + (v.Email || "-") +
//                   "\nPhone: " + (v.PhoneNumber || "-") +
//                   "\nGST: " + (v.GstNumber || "-") +
//                   "\nPAN: " + (v.PanNumber || "-") +
//                   "\nCompany Code: " + (v.CompanyCode || "-") +
//                   "\nAddress: " + (v.Address || "-") +
//                   "\nStatus: " + statusText,
//                   {
//                     title: "Vendor Details"
//                   }
//                 );
//               }
//             })
//           ]
//         })
//       }));
//     },

//     onSpeak: function () {
//       MessageToast.show("Voice input demo");
//     },

//     onAsk: function () {
//       MessageToast.show("AI Response: " + this.byId("aiInput").getValue());
//     }

//   });
// });



sap.ui.define([
  "sap/ui/core/mvc/Controller",
  "sap/m/MessageToast",
  "sap/m/MessageBox",
  "sap/m/CustomListItem",
  "sap/m/VBox",
  "sap/m/HBox",
  "sap/m/Text",
  "sap/m/Button",
  "sap/ui/core/BusyIndicator"
], function (Controller, MessageToast, MessageBox, CustomListItem, VBox, HBox, Text, Button, BusyIndicator) {
  "use strict";

  var BASE_URL = "/sap/opu/odata/sap/ZVENDOR_ODATA_SRV";

  return Controller.extend("vendorportal.controller.Main", {

    // ---------------- LOGIN ----------------
    onLogin: function () {
      var email = this.byId("loginEmail").getValue().trim();
      var password = this.byId("loginPassword").getValue().trim();

      if (email !== "nishsingh61746@gmail.com") {
        MessageBox.error("Access denied.");
        return;
      }

      if (!password) {
        MessageBox.error("Enter password");
        return;
      }

      MessageToast.show("Login success");
      this.byId("mainApp").to(this.byId("homePage"));
    },

    // ---------------- NAVIGATION ----------------
    onOpenOnboard: function () {
      this.byId("mainApp").to(this.byId("onboardPage"));
    },

    onOpenAI: function () {
      this.byId("mainApp").to(this.byId("aiPage"));
    },

    onBack: function () {
      this.byId("mainApp").back();
    },

    // ---------------- REGISTER WITH AUTO ID ----------------
    onRegister: function () {
      var that = this;

      var vendorName = this.byId("name").getValue().trim();
      var email = this.byId("email").getValue().trim();

      if (!vendorName || !email) {
        MessageBox.error("Vendor Name and Email are required.");
        return;
      }

      BusyIndicator.show(0);

      // STEP 1: GET existing vendors to find max ID
      fetch(BASE_URL + "/VendorSet?$format=json", {
        method: "GET",
        credentials: "include",
        headers: {
          "Accept": "application/json"
        }
      })
      .then(function (res) {
        if (!res.ok) throw new Error("GET Failed " + res.status);
        return res.json();
      })
      .then(function (data) {

        var results = data.d && data.d.results ? data.d.results : [];
        var maxId = 0;

        results.forEach(function (v) {
          var id = parseInt(v.VendorId, 10);
          if (!isNaN(id) && id > maxId) {
            maxId = id;
          }
        });

        var newVendorId = String(maxId + 1);

        // STEP 2: Create payload
        var payload = {
          VendorId: newVendorId,
          VendorName: vendorName,
          Email: email,
          PhoneNumber: that.byId("phone").getValue().trim(),
          GstNumber: that.byId("gst").getValue().trim(),
          PanNumber: that.byId("pan").getValue().trim(),
          CompanyCode: that.byId("company").getValue().trim(),
          Address: that.byId("address").getValue().trim(),
          Status: "A"
        };

        // STEP 3: Fetch CSRF token
        return fetch(BASE_URL + "/VendorSet?$top=1&$format=json", {
          method: "GET",
          credentials: "include",
          headers: {
            "X-CSRF-Token": "Fetch"
          }
        })
        .then(function (res) {
          var token = res.headers.get("x-csrf-token");
          if (!token) throw new Error("No CSRF token");

          // STEP 4: POST vendor
          return fetch(BASE_URL + "/VendorSet", {
            method: "POST",
            credentials: "include",
            headers: {
              "Content-Type": "application/json",
              "Accept": "application/json",
              "X-CSRF-Token": token
            },
            body: JSON.stringify(payload)
          });
        });
      })
      .then(function (res) {

        BusyIndicator.hide();

        if (res.ok || res.status === 201) {
          MessageBox.success("✅ Vendor Registered Successfully");

          ["name","email","phone","gst","pan","company","address"]
          .forEach(function (id) {
            that.byId(id).setValue("");
          });

        } else {
          return res.text().then(function (text) {
            console.error("POST failed:", text);
            MessageBox.error("❌ POST Failed " + res.status);
          });
        }

      })
      .catch(function (err) {
        BusyIndicator.hide();
        console.error(err);
        MessageBox.error("⚠️ " + err.message);
      });
    },

    // ---------------- LOAD VENDORS ----------------
    onLoadVendors: function () {
      var list = this.byId("vendorList");
      var that = this;

      list.removeAllItems();
      this.byId("mainApp").to(this.byId("listPage"));

      BusyIndicator.show(0);

      fetch(BASE_URL + "/VendorSet?$format=json", {
        method: "GET",
        credentials: "include",
        headers: {
          "Accept": "application/json"
        }
      })
      .then(function (res) {
        if (!res.ok) throw new Error("GET Failed " + res.status);
        return res.json();
      })
      .then(function (data) {

        BusyIndicator.hide();

        var results = data.d && data.d.results ? data.d.results : [];

        that._addTableHeader();

        results.forEach(function (v) {
          that._addVendorRow(v);
        });

        MessageToast.show("✅ " + results.length + " vendors loaded");

      })
      .catch(function (err) {
        BusyIndicator.hide();
        console.error(err);
        MessageToast.show("Error loading data");
      });
    },

    // ---------------- TABLE UI ----------------
    _getInitials: function (name) {
      if (!name) return "V";

      return name.split(" ")
        .map(function (w) { return w.charAt(0); })
        .join("")
        .toUpperCase()
        .slice(0, 2);
    },

    _addTableHeader: function () {
      var list = this.byId("vendorList");

      list.addItem(new CustomListItem({
        content: new HBox({
          class: "vendorTableHeader",
          items: [
            new Text({ text: "ID", width: "70px", class: "vendorTableHeadText" }),
            new Text({ text: "Vendor", width: "230px", class: "vendorTableHeadText" }),
            new Text({ text: "Email", width: "270px", class: "vendorTableHeadText" }),
            new Text({ text: "Company Code", width: "150px", class: "vendorTableHeadText" }),
            new Text({ text: "Status", width: "120px", class: "vendorTableHeadText" }),
            new Text({ text: "Action", width: "90px", class: "vendorTableHeadText" })
          ]
        })
      }));
    },

    _addVendorRow: function (v) {
      var list = this.byId("vendorList");

      var statusText = v.Status === "A" ? "Active" : "Inactive";
      var statusClass = v.Status === "A" ? "statusActive" : "statusInactive";

      list.addItem(new CustomListItem({
        content: new HBox({
          class: "vendorTableRow",
          alignItems: "Center",
          items: [
            new Text({ text: "#" + (v.VendorId || "-"), width: "70px", class: "vendorTableCell" }),

            new HBox({
              width: "230px",
              alignItems: "Center",
              items: [
                new Text({ text: this._getInitials(v.VendorName), class: "vendorSmallAvatar" }),
                new VBox({
                  items: [
                    new Text({ text: v.VendorName || "-", class: "vendorRowName" }),
                    new Text({ text: v.PhoneNumber || "-", class: "vendorRowSub" })
                  ]
                })
              ]
            }),

            new Text({ text: v.Email || "-", width: "270px", class: "vendorTableCell" }),
            new Text({ text: v.CompanyCode || "-", width: "150px", class: "vendorTableCell" }),
            new Text({ text: statusText, width: "120px", class: statusClass }),

            new Button({
              text: "View",
              press: function () {
                MessageBox.information("Vendor: " + v.VendorName);
              }
            })
          ]
        })
      }));
    },

    onSpeak: function () {
      MessageToast.show("Voice input demo");
    },

    onAsk: function () {
      MessageToast.show("AI: " + this.byId("aiInput").getValue());
    }

  });
});
