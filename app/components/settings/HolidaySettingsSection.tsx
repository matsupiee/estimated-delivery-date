import { useState } from "react";

type CustomNonShippingDay = {
  id: string;
  date: string;
  reason: string | null;
};

type Shopify = {
  toast: {
    show: (message: string, options?: { isError?: boolean }) => void;
  };
};

type HolidaySettingsSectionProps = {
  weeklyNonShippingDays: number[]; // 0=Sun ... 6=Sat
  customNonShippingDays: CustomNonShippingDay[];
  shopify: Shopify;
  onSubmit: (formData: FormData) => void;
};

const DAYS_OF_WEEK = [
  { value: 0, label: "日曜日" },
  { value: 1, label: "月曜日" },
  { value: 2, label: "火曜日" },
  { value: 3, label: "水曜日" },
  { value: 4, label: "木曜日" },
  { value: 5, label: "金曜日" },
  { value: 6, label: "土曜日" },
];

export function HolidaySettingsSection({
  weeklyNonShippingDays,
  customNonShippingDays,
  shopify,
  onSubmit,
}: HolidaySettingsSectionProps) {
  const [selectedDays, setSelectedDays] = useState<Set<number>>(
    () => new Set(weeklyNonShippingDays)
  );
  const [customDate, setCustomDate] = useState("");
  const [customReason, setCustomReason] = useState("");

  const toggleDay = (day: number) => {
    setSelectedDays((prev) => {
      const next = new Set(prev);
      if (next.has(day)) {
        next.delete(day);
      } else {
        next.add(day);
      }
      return next;
    });
  };

  const handleSaveWeeklyHolidays = () => {
    const formData = new FormData();
    formData.append("actionType", "setWeeklyHolidays");
    formData.append("daysOfWeek", JSON.stringify(Array.from(selectedDays)));
    onSubmit(formData);
  };

  const handleAddCustomHoliday = () => {
    if (!customDate) {
      shopify.toast.show("日付を入力してください", { isError: true });
      return;
    }
    const formData = new FormData();
    formData.append("actionType", "addCustomHoliday");
    formData.append("date", customDate);
    formData.append("reason", customReason || "臨時休業");
    onSubmit(formData);
    setCustomDate("");
    setCustomReason("");
  };

  const handleDeleteHoliday = (id: string) => {
    const formData = new FormData();
    formData.append("actionType", "deleteHoliday");
    formData.append("id", id);
    onSubmit(formData);
  };

  return (
    <s-stack direction="block" gap="large">
      {/* 定期休業日 */}
      <div>
        <h3 style={{ margin: "0 0 12px 0", fontSize: "16px" }}>定期休業日</h3>
        <s-stack direction="block" gap="base">
          <s-paragraph>毎週の定休日を設定してください。</s-paragraph>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(120px, 1fr))",
              gap: "8px",
            }}
          >
            {DAYS_OF_WEEK.map((day) => {
              const isSelected = selectedDays.has(day.value);
              return (
                <label
                  key={day.value}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    padding: "8px 12px",
                    background: isSelected ? "#e3f1df" : "white",
                    border: `1px solid ${isSelected ? "#008060" : "#e1e3e5"}`,
                    borderRadius: "6px",
                    cursor: "pointer",
                  }}
                >
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => toggleDay(day.value)}
                    style={{ accentColor: "#008060" }}
                  />
                  <span>{day.label}</span>
                </label>
              );
            })}
          </div>

          <s-button onClick={handleSaveWeeklyHolidays}>
            定期休業日を保存
          </s-button>
        </s-stack>
      </div>

      {/* カスタム休業日 */}
      <div>
        <h3 style={{ margin: "0 0 12px 0", fontSize: "16px" }}>
          カスタム休業日
        </h3>
        <s-stack direction="block" gap="base">
          <s-paragraph>
            夏季休業や臨時休業など、特定の日を休業日として追加できます。
          </s-paragraph>

          <s-stack direction="inline" gap="base">
            <input
              type="date"
              value={customDate}
              onChange={(e) => setCustomDate(e.target.value)}
              style={{
                padding: "8px",
                border: "1px solid #ccc",
                borderRadius: "4px",
              }}
            />
            <input
              type="text"
              value={customReason}
              onChange={(e) => setCustomReason(e.target.value)}
              placeholder="理由（例: 夏季休業）"
              style={{
                padding: "8px",
                border: "1px solid #ccc",
                borderRadius: "4px",
                minWidth: "200px",
              }}
            />
            <s-button onClick={handleAddCustomHoliday}>追加</s-button>
          </s-stack>

          {customNonShippingDays.length > 0 && (
            <div style={{ marginTop: "16px" }}>
              <table
                style={{
                  width: "100%",
                  borderCollapse: "collapse",
                  border: "1px solid #ddd",
                }}
              >
                <thead>
                  <tr style={{ backgroundColor: "#f5f5f5" }}>
                    <th style={{ padding: "8px", textAlign: "left" }}>日付</th>
                    <th style={{ padding: "8px", textAlign: "left" }}>理由</th>
                    <th style={{ padding: "8px", textAlign: "center" }}>操作</th>
                  </tr>
                </thead>
                <tbody>
                  {customNonShippingDays.map((day) => (
                    <tr key={day.id} style={{ borderTop: "1px solid #ddd" }}>
                      <td style={{ padding: "8px" }}>
                        {new Date(day.date).toLocaleDateString("ja-JP")}
                      </td>
                      <td style={{ padding: "8px" }}>{day.reason}</td>
                      <td style={{ padding: "8px", textAlign: "center" }}>
                        <s-button
                          onClick={() => handleDeleteHoliday(day.id)}
                          variant="tertiary"
                        >
                          削除
                        </s-button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </s-stack>
      </div>
    </s-stack>
  );
}
