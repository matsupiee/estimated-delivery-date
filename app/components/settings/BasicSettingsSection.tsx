type BasicSettingsSectionProps = {
  preparationDays: number;
  onPreparationDaysChange: (value: number) => void;
  onSave: () => void;
  isLoading: boolean;
};

export function BasicSettingsSection({
  preparationDays,
  onPreparationDaysChange,
  onSave,
  isLoading,
}: BasicSettingsSectionProps) {
  return (
    <s-stack direction="block" gap="base">
      <s-paragraph>
        注文を受けてから発送までにかかる営業日数を設定してください。
      </s-paragraph>

      <s-stack direction="inline" gap="base">
        <s-text>発送準備日数:</s-text>
        <input
          type="number"
          value={preparationDays}
          onChange={(e) => onPreparationDaysChange(parseInt(e.target.value, 10))}
          min="0"
          max="30"
          style={{
            padding: "8px",
            border: "1px solid #ccc",
            borderRadius: "4px",
            width: "80px",
          }}
        />
        <s-text>営業日</s-text>
      </s-stack>

      <s-button onClick={onSave} {...(isLoading ? { loading: true } : {})}>
        保存
      </s-button>
    </s-stack>
  );
}
