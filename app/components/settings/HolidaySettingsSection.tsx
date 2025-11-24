import { useState } from "react";

type NonShippingDay = {
  id: string;
  date: string;
  reason: string | null;
  dayOfWeek: number | null;
};

type Holiday = {
  id: string;
  date: string;
  name: string;
  year: number;
};

type Shopify = {
  toast: {
    show: (message: string, options?: { isError?: boolean }) => void;
  };
};

type HolidaySettingsSectionProps = {
  nonShippingDays: NonShippingDay[];
  holidays: Holiday[];
  selectedHolidayDates: string[];
  shopify: Shopify;
  onSubmit: (formData: FormData) => void;
};

export function HolidaySettingsSection({
  nonShippingDays,
  holidays,
  selectedHolidayDates,
  shopify,
  onSubmit,
}: HolidaySettingsSectionProps) {
  const [saturday, setSaturday] = useState(() =>
    nonShippingDays.some((day) => day.dayOfWeek === 6)
  );
  const [sunday, setSunday] = useState(() =>
    nonShippingDays.some((day) => day.dayOfWeek === 0)
  );
  const [customDate, setCustomDate] = useState("");
  const [customReason, setCustomReason] = useState("");

  // 選択された祝日の日付を管理
  const [selectedDates, setSelectedDates] = useState<Set<string>>(
    () => new Set(selectedHolidayDates)
  );

  const handleSaveWeeklyHolidays = () => {
    const formData = new FormData();
    formData.append("actionType", "setWeeklyHolidays");
    formData.append("saturday", saturday.toString());
    formData.append("sunday", sunday.toString());
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

  // 祝日の選択を切り替え
  const toggleHoliday = (dateString: string) => {
    setSelectedDates((prev) => {
      const next = new Set(prev);
      if (next.has(dateString)) {
        next.delete(dateString);
      } else {
        next.add(dateString);
      }
      return next;
    });
  };

  // 全選択
  const selectAll = () => {
    const allDates = holidays.map((h) => h.date.split("T")[0]);
    setSelectedDates(new Set(allDates));
  };

  // 全選択解除
  const deselectAll = () => {
    setSelectedDates(new Set());
  };

  // 祝日休業設定を保存
  const handleSaveHolidays = () => {
    const formData = new FormData();
    formData.append("actionType", "saveHolidays");
    const selectedHolidays = holidays
      .filter((h) => selectedDates.has(h.date.split("T")[0]))
      .map((h) => ({ date: h.date, name: h.name }));
    formData.append("selectedDates", JSON.stringify(selectedHolidays));
    onSubmit(formData);
  };

  // カスタム休業日（祝日以外）
  const customHolidays = nonShippingDays.filter(
    (day) => day.dayOfWeek === null && !day.reason?.startsWith("祝日:")
  );

  // 年ごとにグループ化
  const holidaysByYear = holidays.reduce(
    (acc, holiday) => {
      if (!acc[holiday.year]) {
        acc[holiday.year] = [];
      }
      acc[holiday.year].push(holiday);
      return acc;
    },
    {} as Record<number, Holiday[]>
  );

  return (
    <s-stack direction="block" gap="large">
      {/* 定期休業日 */}
      <div>
        <h3 style={{ margin: "0 0 12px 0", fontSize: "16px" }}>定期休業日</h3>
        <s-stack direction="block" gap="base">
          <s-paragraph>毎週の定休日を設定してください。</s-paragraph>

          <s-stack direction="block" gap="small">
            <label
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
              }}
            >
              <input
                type="checkbox"
                checked={saturday}
                onChange={(e) => setSaturday(e.target.checked)}
              />
              <span>土曜日</span>
            </label>

            <label
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
              }}
            >
              <input
                type="checkbox"
                checked={sunday}
                onChange={(e) => setSunday(e.target.checked)}
              />
              <span>日曜日</span>
            </label>
          </s-stack>

          <s-button onClick={handleSaveWeeklyHolidays}>
            定期休業日を保存
          </s-button>
        </s-stack>
      </div>

      {/* 祝日 */}
      <div>
        <h3 style={{ margin: "0 0 12px 0", fontSize: "16px" }}>祝日休業設定</h3>
        <s-stack direction="block" gap="base">
          <s-paragraph>
            休業日とする祝日にチェックを入れてください。チェックされた祝日は配送予定日の計算時にスキップされます。
          </s-paragraph>

          {holidays.length === 0 ? (
            <s-paragraph>
              祝日データがありません。システム管理者にお問い合わせください。
            </s-paragraph>
          ) : (
            <>
              {/* 全選択/全解除ボタン */}
              <div style={{ display: "flex", gap: "8px" }}>
                <s-button onClick={selectAll} variant="secondary">
                  すべて選択
                </s-button>
                <s-button onClick={deselectAll} variant="secondary">
                  すべて解除
                </s-button>
              </div>

              {/* 年ごとの祝日一覧 */}
              {Object.entries(holidaysByYear).map(([year, yearHolidays]) => (
                <div key={year}>
                  <h4
                    style={{
                      margin: "16px 0 8px 0",
                      fontSize: "14px",
                      color: "#6c7179",
                    }}
                  >
                    {year}年
                  </h4>
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
                      gap: "8px",
                      padding: "12px",
                      border: "1px solid #e1e3e5",
                      borderRadius: "8px",
                      background: "#fafbfc",
                    }}
                  >
                    {yearHolidays.map((holiday) => {
                      const dateString = holiday.date.split("T")[0];
                      const isSelected = selectedDates.has(dateString);
                      const formattedDate = new Date(
                        holiday.date
                      ).toLocaleDateString("ja-JP", {
                        month: "short",
                        day: "numeric",
                        weekday: "short",
                      });

                      return (
                        <label
                          key={holiday.id}
                          aria-label={`${holiday.name} (${formattedDate})`}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "8px",
                            padding: "8px",
                            background: isSelected ? "#e3f1df" : "white",
                            border: `1px solid ${isSelected ? "#008060" : "#e1e3e5"}`,
                            borderRadius: "6px",
                            cursor: "pointer",
                            transition: "all 0.2s",
                          }}
                        >
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => toggleHoliday(dateString)}
                            style={{ accentColor: "#008060" }}
                          />
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div
                              style={{
                                fontWeight: 500,
                                fontSize: "13px",
                                whiteSpace: "nowrap",
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                              }}
                            >
                              {holiday.name}
                            </div>
                            <div
                              style={{
                                fontSize: "12px",
                                color: "#6c7179",
                              }}
                            >
                              {formattedDate}
                            </div>
                          </div>
                        </label>
                      );
                    })}
                  </div>
                </div>
              ))}

              <div style={{ marginTop: "8px" }}>
                <s-button onClick={handleSaveHolidays}>
                  祝日休業設定を保存
                </s-button>
              </div>
            </>
          )}
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

          {customHolidays.length > 0 && (
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
                  {customHolidays.map((holiday) => (
                    <tr
                      key={holiday.id}
                      style={{ borderTop: "1px solid #ddd" }}
                    >
                      <td style={{ padding: "8px" }}>
                        {new Date(holiday.date).toLocaleDateString("ja-JP")}
                      </td>
                      <td style={{ padding: "8px" }}>{holiday.reason}</td>
                      <td style={{ padding: "8px", textAlign: "center" }}>
                        <s-button
                          onClick={() => handleDeleteHoliday(holiday.id)}
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
