import { useState, useEffect } from "react";
import { Spinner } from "../ui/Spinner";
import { HolidayPickerModal } from "./HolidayPickerModal";

type CustomNonShippingDay = {
  id: string;
  date: string;
  reason: string | null;
};

type JapaneseHoliday = {
  date: string;
  name: string;
};

type Shopify = {
  toast: {
    show: (message: string, options?: { isError?: boolean }) => void;
  };
};

type HolidaySettingsSectionProps = {
  weeklyNonShippingDays: number[]; // 0=Sun ... 6=Sat
  customNonShippingDays: CustomNonShippingDay[];
  japaneseHolidays: JapaneseHoliday[];
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
  japaneseHolidays,
  shopify,
  onSubmit,
}: HolidaySettingsSectionProps) {
  const [selectedDays, setSelectedDays] = useState<Set<number>>(
    () => new Set(weeklyNonShippingDays)
  );
  const [customDate, setCustomDate] = useState("");
  const [customReason, setCustomReason] = useState("");
  const [isHolidayModalOpen, setIsHolidayModalOpen] = useState(false);
  const [deletingIds, setDeletingIds] = useState<Set<string>>(new Set());
  const [isAddingHolidays, setIsAddingHolidays] = useState(false);

  // customNonShippingDaysが変わったらローディング状態をリセット
  useEffect(() => {
    setIsAddingHolidays(false);
    setDeletingIds(new Set());
  }, [customNonShippingDays]);

  // 既に登録済みの日付を取得
  const existingDates = new Set(
    customNonShippingDays.map((day) => day.date.split("T")[0])
  );

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
    if (deletingIds.has(id)) return;
    setDeletingIds((prev) => new Set(prev).add(id));
    const formData = new FormData();
    formData.append("actionType", "deleteHoliday");
    formData.append("id", id);
    onSubmit(formData);
  };

  const handleAddHolidaysFromModal = (
    holidays: { date: string; reason: string }[]
  ) => {
    setIsAddingHolidays(true);
    const formData = new FormData();
    formData.append("actionType", "addCustomHolidaysBulk");
    formData.append("holidays", JSON.stringify(holidays));
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

          <div>
            <button
              onClick={() => setIsHolidayModalOpen(true)}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                padding: "8px 16px",
                background: "white",
                border: "1px solid #008060",
                borderRadius: "6px",
                color: "#008060",
                cursor: "pointer",
                fontSize: "14px",
                fontWeight: 500,
              }}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                <line x1="16" y1="2" x2="16" y2="6" />
                <line x1="8" y1="2" x2="8" y2="6" />
                <line x1="3" y1="10" x2="21" y2="10" />
              </svg>
              祝日から選ぶ
            </button>
          </div>

          {/* 祝日選択モーダル */}
          <HolidayPickerModal
            isOpen={isHolidayModalOpen}
            onClose={() => setIsHolidayModalOpen(false)}
            japaneseHolidays={japaneseHolidays}
            existingDates={existingDates}
            onAddHolidays={handleAddHolidaysFromModal}
            isLoading={isAddingHolidays}
          />

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
                {customNonShippingDays.length > 0 ? (
                  customNonShippingDays.map((day) => {
                    const isDeleting = deletingIds.has(day.id);
                    return (
                      <tr key={day.id} style={{ borderTop: "1px solid #ddd" }}>
                        <td style={{ padding: "8px" }}>
                          {new Date(day.date).toLocaleDateString("ja-JP")}
                        </td>
                        <td style={{ padding: "8px" }}>{day.reason}</td>
                        <td style={{ padding: "8px", textAlign: "center" }}>
                          <button
                            onClick={() => handleDeleteHoliday(day.id)}
                            disabled={isDeleting}
                            style={{
                              background: "none",
                              border: "none",
                              cursor: isDeleting ? "not-allowed" : "pointer",
                              padding: "4px 8px",
                              borderRadius: "4px",
                              color: "#6d7175",
                              transition: "color 0.2s",
                              opacity: isDeleting ? 0.5 : 1,
                            }}
                            onMouseEnter={(e) => {
                              if (!isDeleting) {
                                e.currentTarget.style.color = "#d72c0d";
                              }
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.color = "#6d7175";
                            }}
                            title={isDeleting ? "削除中..." : "削除"}
                          >
                            {isDeleting ? (
                              <Spinner size={18} />
                            ) : (
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="18"
                                height="18"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              >
                                <polyline points="3 6 5 6 21 6" />
                                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                                <line x1="10" y1="11" x2="10" y2="17" />
                                <line x1="14" y1="11" x2="14" y2="17" />
                              </svg>
                            )}
                          </button>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr style={{ borderTop: "1px solid #ddd" }}>
                    <td
                      colSpan={3}
                      style={{
                        padding: "24px 8px",
                        textAlign: "center",
                        color: "#6d7175",
                      }}
                    >
                      カスタム休業日はまだ登録されていません
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </s-stack>
      </div>
    </s-stack>
  );
}
