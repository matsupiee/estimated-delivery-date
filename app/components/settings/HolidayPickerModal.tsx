import { useState } from "react";
import { Spinner } from "../ui/Spinner";

type JapaneseHoliday = {
  date: string;
  name: string;
};

type HolidayPickerModalProps = {
  isOpen: boolean;
  onClose: () => void;
  japaneseHolidays: JapaneseHoliday[];
  existingDates: Set<string>;
  onAddHolidays: (holidays: { date: string; reason: string }[]) => void;
  isLoading?: boolean;
};

export function HolidayPickerModal({
  isOpen,
  onClose,
  japaneseHolidays,
  existingDates,
  onAddHolidays,
  isLoading = false,
}: HolidayPickerModalProps) {
  const [selectedHolidays, setSelectedHolidays] = useState<Set<string>>(
    new Set()
  );

  // 祝日が登録済みかどうかを判定
  const isHolidayRegistered = (holidayDate: string) => {
    return existingDates.has(holidayDate.split("T")[0]);
  };

  // 未登録の祝日のみ
  const availableHolidays = japaneseHolidays.filter(
    (holiday) => !isHolidayRegistered(holiday.date)
  );

  const toggleHolidaySelection = (date: string) => {
    if (isHolidayRegistered(date)) return;

    setSelectedHolidays((prev) => {
      const next = new Set(prev);
      if (next.has(date)) {
        next.delete(date);
      } else {
        next.add(date);
      }
      return next;
    });
  };

  const handleSelectAll = () => {
    setSelectedHolidays(new Set(availableHolidays.map((h) => h.date)));
  };

  const handleDeselectAll = () => {
    setSelectedHolidays(new Set());
  };

  const handleSubmit = () => {
    if (selectedHolidays.size === 0) return;

    const holidaysToAdd: { date: string; reason: string }[] = [];
    selectedHolidays.forEach((date) => {
      const holiday = japaneseHolidays.find((h) => h.date === date);
      if (holiday) {
        holidaysToAdd.push({
          date: date.split("T")[0],
          reason: holiday.name,
        });
      }
    });

    onAddHolidays(holidaysToAdd);
    setSelectedHolidays(new Set());
    onClose();
  };

  const handleClose = () => {
    setSelectedHolidays(new Set());
    onClose();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      handleClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div
      role="button"
      tabIndex={0}
      onKeyDown={handleKeyDown}
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: "rgba(0, 0, 0, 0.5)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000,
      }}
      onClick={handleClose}
    >
      {/* eslint-disable-next-line jsx-a11y/no-noninteractive-element-interactions */}
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="holiday-picker-title"
        style={{
          background: "white",
          borderRadius: "12px",
          width: "90%",
          maxWidth: "500px",
          maxHeight: "80vh",
          display: "flex",
          flexDirection: "column",
        }}
        onClick={(e) => e.stopPropagation()}
        onKeyDown={(e) => e.stopPropagation()}
      >
        {/* モーダルヘッダー */}
        <div
          style={{
            padding: "16px 20px",
            borderBottom: "1px solid #e1e3e5",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <h3 style={{ margin: 0, fontSize: "18px" }}>祝日から選ぶ</h3>
          <button
            onClick={handleClose}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              fontSize: "24px",
              color: "#6d7175",
              padding: "0",
              lineHeight: 1,
            }}
          >
            ×
          </button>
        </div>

        {/* 全選択・全解除ボタン */}
        <div
          style={{
            padding: "12px 20px",
            borderBottom: "1px solid #e1e3e5",
            display: "flex",
            gap: "12px",
          }}
        >
          <button
            onClick={handleSelectAll}
            style={{
              padding: "6px 12px",
              background: "#f6f6f7",
              border: "1px solid #c9cccf",
              borderRadius: "4px",
              cursor: "pointer",
              fontSize: "13px",
            }}
          >
            全選択
          </button>
          <button
            onClick={handleDeselectAll}
            style={{
              padding: "6px 12px",
              background: "#f6f6f7",
              border: "1px solid #c9cccf",
              borderRadius: "4px",
              cursor: "pointer",
              fontSize: "13px",
            }}
          >
            全選択解除
          </button>
          <span
            style={{
              marginLeft: "auto",
              color: "#6d7175",
              fontSize: "13px",
              alignSelf: "center",
            }}
          >
            {selectedHolidays.size}件選択中
          </span>
        </div>

        {/* 祝日リスト */}
        <div
          style={{
            flex: 1,
            overflowY: "auto",
            padding: "12px 20px",
          }}
        >
          {japaneseHolidays.length > 0 ? (
            japaneseHolidays.map((holiday) => {
              const isRegistered = isHolidayRegistered(holiday.date);
              const isSelected =
                isRegistered || selectedHolidays.has(holiday.date);
              return (
                <label
                  key={holiday.date}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "12px",
                    padding: "10px 12px",
                    marginBottom: "4px",
                    background: isSelected ? "#e3f1df" : "#f6f6f7",
                    border: `1px solid ${isSelected ? "#008060" : "transparent"}`,
                    borderRadius: "6px",
                    cursor: isRegistered ? "not-allowed" : "pointer",
                    opacity: isRegistered ? 0.6 : 1,
                  }}
                >
                  <input
                    type="checkbox"
                    checked={isSelected}
                    disabled={isRegistered}
                    onChange={() => toggleHolidaySelection(holiday.date)}
                    style={{ accentColor: "#008060" }}
                  />
                  <span style={{ flex: 1 }}>
                    <span style={{ fontWeight: 500 }}>
                      {new Date(holiday.date).toLocaleDateString("ja-JP", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                        weekday: "short",
                      })}
                    </span>
                    <span
                      style={{
                        marginLeft: "12px",
                        color: "#6d7175",
                      }}
                    >
                      {holiday.name}
                    </span>
                    {isRegistered && (
                      <span
                        style={{
                          marginLeft: "8px",
                          fontSize: "12px",
                          color: "#008060",
                          fontWeight: 500,
                        }}
                      >
                        登録済み
                      </span>
                    )}
                  </span>
                </label>
              );
            })
          ) : (
            <p
              style={{
                textAlign: "center",
                color: "#6d7175",
                padding: "24px",
              }}
            >
              祝日データがありません
            </p>
          )}
        </div>

        {/* モーダルフッター */}
        <div
          style={{
            padding: "16px 20px",
            borderTop: "1px solid #e1e3e5",
            display: "flex",
            justifyContent: "flex-end",
            gap: "12px",
          }}
        >
          <button
            onClick={handleClose}
            style={{
              padding: "8px 16px",
              background: "white",
              border: "1px solid #c9cccf",
              borderRadius: "6px",
              cursor: "pointer",
              fontSize: "14px",
            }}
          >
            キャンセル
          </button>
          <button
            onClick={handleSubmit}
            disabled={selectedHolidays.size === 0 || isLoading}
            style={{
              padding: "8px 16px",
              background:
                selectedHolidays.size === 0 || isLoading ? "#c9cccf" : "#008060",
              border: "none",
              borderRadius: "6px",
              color: "white",
              cursor:
                selectedHolidays.size === 0 || isLoading
                  ? "not-allowed"
                  : "pointer",
              fontSize: "14px",
              fontWeight: 500,
              display: "flex",
              alignItems: "center",
              gap: "6px",
            }}
          >
            {isLoading ? (
              <>
                <Spinner size={14} />
                追加中...
              </>
            ) : (
              `追加（${selectedHolidays.size}件）`
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
