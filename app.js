import {
  computeCostPerKm,
  computeCombinations,
  isUnprofitable,
} from "./lib/calc.js";

const messages = {
  en: {
    title: "E-Hailing Financial Calculator",
    tagline:
      "Plan your driving month — targets, distance, and gross earnings at a glance.",
    sections: {
      inputs: "Fuel & Earnings",
      targets: "Targets & Working Days",
      results: "Results",
    },
    fuelCost: "How much do you usually spend on fuel? (RM)",
    fuelKm: "How far can you drive with that fuel? (KM)",
    perKm: "How much do you earn per kilometer? (RM)",
    netTarget: "Net Income Targets (RM) - multiple selections allowed",
    workingDays: "Working Days per Month - multiple selections allowed",
    custom: "Custom",
    daysUnit: "days",
    addIncome: "Add custom income",
    addDays: "Add custom days",
    customIncomePlaceholder: "Enter custom income",
    customDaysPlaceholder: "Enter custom days",
    rows: "{n} row | {n} rows",
    empty: {
      title: "No combinations yet",
      body: "Pick at least one net income target and one working-day count, and fill in your fuel details above.",
    },
    export: "Export to PDF",
    unprofitable:
      "Unprofitable: your fuel cost per km (RM {cost}) is at or above your earnings per km (RM {earn}). No distance can reach a net income target — raise earnings per km or cut fuel cost.",
    notApplicable: "—",
    table: {
      days: "Working Days",
      net: "Net Target",
      netPerDay: "Net/Day (RM)",
      kmPerDay: "Required KM/Day",
      grossDay: "Gross/Day (RM)",
      grossMonth: "Gross/Month (RM)",
    },
  },
  ms: {
    title: "Kalkulator Kewangan E-Hailing",
    tagline:
      "Rancang bulan pemanduan anda — sasaran, jarak dan pendapatan kasar sepintas lalu.",
    sections: {
      inputs: "Minyak & Pendapatan",
      targets: "Sasaran & Hari Bekerja",
      results: "Keputusan",
    },
    fuelCost: "Berapakah kos miyak petrol yang anda biasa isi? (RM)",
    fuelKm: "Berapakah jarak yang boleh dipandu dengan isian itu? (KM)",
    perKm: "Berapakah pendapatan anda dapat bagi setiap km? (RM)",
    netTarget: "Sasaran Pendapatan Bersih (RM) - pelbagai pilihan dibenarkan",
    workingDays: "Hari Bekerja Sebulan - pelbagai pilihan dibenarkan",
    custom: "Tersuai",
    daysUnit: "hari",
    addIncome: "Tambah pendapatan tersuai",
    addDays: "Tambah hari tersuai",
    customIncomePlaceholder: "Masukkan pendapatan tersuai",
    customDaysPlaceholder: "Masukkan bilangan hari",
    rows: "{n} baris | {n} baris",
    empty: {
      title: "Tiada kombinasi lagi",
      body: "Pilih sekurang-kurangnya satu sasaran pendapatan bersih dan satu bilangan hari bekerja, dan isikan maklumat minyak anda di atas.",
    },
    export: "Eksport ke PDF",
    unprofitable:
      "Tidak menguntungkan: kos petrol setiap km (RM {cost}) sama atau melebihi pendapatan setiap km (RM {earn}). Tiada jarak yang dapat mencapai sasaran pendapatan bersih — naikkan pendapatan setiap km atau kurangkan kos petrol.",
    notApplicable: "—",
    table: {
      days: "Hari Bekerja",
      net: "Sasaran Bersih",
      netPerDay: "Bersih/Hari (RM)",
      kmPerDay: "KM Diperlukan/Hari",
      grossDay: "Kasar/Hari (RM)",
      grossMonth: "Kasar/Bulan (RM)",
    },
  },
};

const i18n = VueI18n.createI18n({
  locale: "en",
  fallbackLocale: "en",
  messages,
});

const { createApp, ref, computed } = Vue;
const app = createApp({
  setup() {
    const incomeOptions = [3500, 4000];
    const daysOptions = [20, 24];

    const selectedIncomes = ref([incomeOptions[0]]);
    const selectedDays = ref([daysOptions[0]]);

    const customIncomes = ref([]);
    const customDays = ref([]);

    const fuelCost = ref(60);
    const fuelKm = ref(400);
    const earningsPerKm = ref(0.7);

    const sortKey = ref("days");
    const sortAsc = ref(true);

    const addCustomIncome = () => customIncomes.value.push(null);
    const addCustomDays = () => customDays.value.push(null);

    // Chip-group toggles for the income/days selections. Same arrays as the old
    // native multi-selects (numbers + the "custom" sentinel) — only the control
    // changed, not the state model.
    const toggleSelection = (list, value) => {
      const idx = list.value.indexOf(value);
      if (idx === -1) list.value.push(value);
      else list.value.splice(idx, 1);
    };
    const toggleIncome = (value) => {
      toggleSelection(selectedIncomes, value);
      // First time "custom" is switched on, seed one empty input.
      if (
        value === "custom" &&
        selectedIncomes.value.includes("custom") &&
        customIncomes.value.length === 0
      ) {
        addCustomIncome();
      }
    };
    const toggleDay = (value) => {
      toggleSelection(selectedDays, value);
      if (
        value === "custom" &&
        selectedDays.value.includes("custom") &&
        customDays.value.length === 0
      ) {
        addCustomDays();
      }
    };

    const allNetTargets = computed(() => {
      return [
        ...selectedIncomes.value.filter((i) => i !== "custom").map(Number),
        ...customIncomes.value.filter((val) => val),
      ];
    });

    const allWorkingDays = computed(() => {
      return [
        ...selectedDays.value.filter((i) => i !== "custom").map(Number),
        ...customDays.value.filter((val) => val),
      ];
    });

    const costPerKm = computed(() =>
      computeCostPerKm({ fuelCost: fuelCost.value, fuelKm: fuelKm.value })
    );

    const unprofitable = computed(() =>
      isUnprofitable({
        fuelCost: fuelCost.value,
        fuelKm: fuelKm.value,
        earningsPerKm: earningsPerKm.value,
      })
    );

    // RM formatter that survives Infinity (fuelKm 0) and blank inputs.
    const fmtRM = (v) => (Number.isFinite(v) ? v.toFixed(2) : "∞");

    const targetCombinations = computed(() =>
      computeCombinations({
        incomes: allNetTargets.value,
        daysList: allWorkingDays.value,
        fuelCost: fuelCost.value,
        fuelKm: fuelKm.value,
        earningsPerKm: earningsPerKm.value,
      })
    );

    const sortedCombinations = computed(() => {
      return [...targetCombinations.value].sort((a, b) => {
        const key = sortKey.value;
        return sortAsc.value ? a[key] - b[key] : b[key] - a[key];
      });
    });

    const sortBy = (key) => {
      if (sortKey.value === key) sortAsc.value = !sortAsc.value;
      else {
        sortKey.value = key;
        sortAsc.value = true;
      }
    };

    const exportPDF = () => {
      const { jsPDF } = window.jspdf;
      const doc = new jsPDF();
      doc.setFont("Helvetica");
      doc.setFontSize(12);
      doc.text("Financial Calculator Export", 14, 14);

      const headers = [
        [
          "Working Days",
          "Net Target",
          "Net/Day",
          "Required KM/Day",
          "Gross/Day",
          "Gross/Month",
        ],
      ];
      const rows = sortedCombinations.value.map((combo) => [
        combo.days,
        `RM ${combo.income.toFixed(2)}`,
        `RM ${combo.netPerDay.toFixed(2)}`,
        combo.unprofitable ? "—" : `${combo.requiredKM} km`,
        combo.unprofitable ? "—" : `RM ${combo.grossPerDay.toFixed(2)}`,
        combo.unprofitable ? "—" : `RM ${combo.grossPerMonth.toFixed(2)}`,
      ]);

      doc.autoTable({ head: headers, body: rows, startY: 20 });
      doc.save("financial_calculator.pdf");
    };

    return {
      incomeOptions,
      daysOptions,
      selectedIncomes,
      selectedDays,
      customIncomes,
      customDays,
      fuelCost,
      fuelKm,
      earningsPerKm,
      addCustomIncome,
      addCustomDays,
      toggleIncome,
      toggleDay,
      costPerKm,
      unprofitable,
      fmtRM,
      allNetTargets,
      allWorkingDays,
      targetCombinations,
      sortedCombinations,
      sortBy,
      sortKey,
      sortAsc,
      exportPDF,
    };
  },
});

app.use(i18n);
app.mount("#app");
