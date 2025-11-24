import type { ReactNode } from "react";

export type SectionId = "basic" | "regions" | "holidays";

type AccordionSectionProps = {
  id: SectionId;
  title: string;
  isOpen: boolean;
  isLast: boolean;
  onToggle: () => void;
  children: ReactNode;
};

export function AccordionSection({
  title,
  isOpen,
  isLast,
  onToggle,
  children,
}: AccordionSectionProps) {
  return (
    <div style={{ display: "flex", gap: "16px" }}>
      {/* 左側のプログレスバー */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          width: "24px",
          flexShrink: 0,
        }}
      >
        <div
          style={{
            width: "12px",
            height: "12px",
            borderRadius: "50%",
            background: isOpen ? "#008060" : "#c9cccf",
            flexShrink: 0,
          }}
        />
        {!isLast && (
          <div
            style={{
              width: "2px",
              flex: 1,
              background: "#c9cccf",
              marginTop: "4px",
            }}
          />
        )}
      </div>

      {/* コンテンツ */}
      <div style={{ flex: 1, paddingBottom: isLast ? 0 : "24px" }}>
        <button
          onClick={onToggle}
          style={{
            background: "none",
            border: "none",
            padding: 0,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: "8px",
            width: "100%",
            textAlign: "left",
          }}
        >
          <h2
            style={{
              margin: 0,
              fontSize: "18px",
              fontWeight: 600,
              color: isOpen ? "#202223" : "#6d7175",
            }}
          >
            {title}
          </h2>
          <span
            style={{
              fontSize: "12px",
              color: "#6d7175",
              transform: isOpen ? "rotate(180deg)" : "rotate(0deg)",
              transition: "transform 0.2s",
            }}
          >
            ▼
          </span>
        </button>

        {isOpen && (
          <div
            style={{
              marginTop: "16px",
              paddingLeft: "4px",
              borderLeft: "2px solid #e1e3e5",
            }}
          >
            <div style={{ paddingLeft: "16px" }}>{children}</div>
          </div>
        )}
      </div>
    </div>
  );
}
