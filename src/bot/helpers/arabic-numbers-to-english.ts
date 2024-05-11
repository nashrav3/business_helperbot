export function arabicNumeralsToEnglish(arabicNumber: string): string {
  const arabicEnglishMap: { [key: string]: string | undefined } = {
    "٠": "0",
    "١": "1",
    "٢": "2",
    "٣": "3",
    "٤": "4",
    "٥": "5",
    "٦": "6",
    "٧": "7",
    "٨": "8",
    "٩": "9",
  };

  let englishNumber = "";
  for (const element of arabicNumber) {
    englishNumber += arabicEnglishMap[element] || element;
  }

  return englishNumber;
}
