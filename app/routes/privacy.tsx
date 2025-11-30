export default function Privacy() {
  return (
    <div style={{
      maxWidth: "800px",
      margin: "0 auto",
      padding: "40px 20px",
      fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
      lineHeight: "1.7",
      color: "#333"
    }}>
      <h1 style={{ fontSize: "32px", fontWeight: "700", marginBottom: "10px", color: "#1a1a1a" }}>
        プライバシーポリシー
      </h1>
      <p style={{ color: "#666", marginBottom: "40px" }}>
        最終更新日: 2025年11月30日
      </p>

      <Section title="1. 事業者情報">
        <p>
          本アプリ「配送予定日計算」（以下「本アプリ」）は、個人開発者が提供するShopifyアプリです。
        </p>
        <ul>
          <li>連絡先: h83688215@gmail.com</li>
        </ul>
      </Section>

      <Section title="2. 収集する情報">
        <p>本アプリは、以下の情報を収集・保存します。</p>

        <Subsection title="2.1 マーチャント（ストアオーナー）の情報">
          <ul>
            <li><strong>ショップ情報:</strong> ショップドメイン、ストアオーナーの氏名・メールアドレス</li>
            <li><strong>認証情報:</strong> Shopify APIアクセストークン、セッション情報</li>
            <li>
              <strong>アプリ設定データ:</strong>
              <ul style={{ marginTop: "8px" }}>
                <li>発送準備日数</li>
                <li>同日発送の締め時間</li>
                <li>都道府県別配送日数</li>
                <li>定期休業日（曜日）</li>
                <li>カスタム休業日（日付・理由）</li>
              </ul>
            </li>
          </ul>
        </Subsection>

        <Subsection title="2.2 エンドカスタマー（ストア訪問者）の情報">
          <ul>
            <li><strong>IPアドレス:</strong> 配送先地域（都道府県）を推定する目的でのみ収集します</li>
            <li><strong>推定された都道府県情報:</strong> IPアドレスから推定した都道府県名</li>
          </ul>
          <div style={{
            background: "#e7f4ec",
            border: "1px solid #b4e2c2",
            borderRadius: "8px",
            padding: "16px",
            marginTop: "16px"
          }}>
            <strong style={{ display: "block", marginBottom: "8px", color: "#0f5132" }}>重要な注意事項:</strong>
            <ul style={{ marginBottom: 0 }}>
              <li>本アプリは、IPアドレスを個人の特定や追跡に使用しません</li>
              <li>IPアドレスは都道府県レベルの地域推定にのみ使用され、個人を識別する情報とは紐付けられません</li>
              <li>本アプリは、エンドカスタマーの氏名・住所・メールアドレス・注文情報などの個人識別可能な情報は一切収集しません</li>
            </ul>
          </div>
        </Subsection>
      </Section>

      <Section title="3. 情報の使用目的">
        <p>収集した情報は、以下の目的でのみ使用します。</p>

        <Subsection title="3.1 マーチャント情報">
          <ul>
            <li>本アプリの提供・運用</li>
            <li>Shopify APIへのアクセス認証</li>
            <li>マーチャントが設定した配送条件の保存・管理</li>
            <li>サポート対応</li>
          </ul>
        </Subsection>

        <Subsection title="3.2 エンドカスタマー情報">
          <ul>
            <li><strong>配送先地域の推定:</strong> IPアドレスから都道府県を推定し、その地域に適した配送予定日を計算・表示</li>
            <li><strong>サービス品質の向上:</strong> レート制限対策のための一時的なキャッシュ（最大30日間）</li>
          </ul>
          <div style={{
            background: "#fff5f3",
            border: "1px solid #f5c5bb",
            borderRadius: "8px",
            padding: "16px",
            marginTop: "16px"
          }}>
            <strong style={{ display: "block", marginBottom: "8px", color: "#b12b09" }}>IPアドレスは以下の用途には使用しません:</strong>
            <ul style={{ marginBottom: 0 }}>
              <li>個人の特定や識別</li>
              <li>ユーザー行動の追跡</li>
              <li>マーケティングやターゲティング広告</li>
              <li>第三者への販売や提供</li>
            </ul>
          </div>
        </Subsection>
      </Section>

      <Section title="4. 情報の保存期間">
        <ul>
          <li><strong>マーチャント情報:</strong> アプリをアンインストールするまで保存します</li>
          <li><strong>エンドカスタマーのIPアドレス:</strong> 最大30日間キャッシュとして保存し、その後自動的に削除されます</li>
          <li><strong>推定された都道府県情報:</strong> IPアドレスと同様に最大30日間保存され、その後自動的に削除されます</li>
        </ul>
      </Section>

      <Section title="5. 情報の共有">
        <p>運営者は、以下の場合を除き、収集した情報を第三者と共有しません。</p>
        <ul>
          <li>
            <strong>MaxMind GeoLite:</strong> IPアドレスから地域を推定するため、MaxMind GeoLiteデータベースを使用します
            （IPアドレスはMaxMindに送信されず、アプリ内でローカルに処理されます）
          </li>
          <li><strong>法的義務:</strong> 法律で義務付けられている場合</li>
          <li><strong>マーチャントの同意:</strong> マーチャントから明示的な同意を得た場合</li>
        </ul>
        <p style={{ marginTop: "12px" }}>
          運営者は、エンドカスタマーのIPアドレスを第三者に販売・レンタル・共有することはありません。
        </p>
      </Section>

      <Section title="6. データのセキュリティ">
        <p>運営者は、収集した情報を不正アクセス・紛失・破壊・改ざんから保護するため、業界標準のセキュリティ対策を講じています。</p>
        <ul>
          <li>データベースへのアクセス制限</li>
          <li>通信の暗号化（HTTPS/TLS）</li>
          <li>アクセストークンの安全な保存</li>
          <li>IPアドレスキャッシュの自動削除（30日後）</li>
        </ul>
      </Section>

      <Section title="7. マーチャントの権利">
        <p>マーチャントは、以下の権利を有します。</p>

        <Subsection title="7.1 アクセス・修正・削除">
          <ul>
            <li>保存されているデータへのアクセス</li>
            <li>設定データの修正</li>
            <li>アプリのアンインストールによるすべてのデータの削除</li>
          </ul>
        </Subsection>

        <Subsection title="7.2 データ削除の自動対応">
          <p>本アプリは、Shopifyの強制Webhookに対応しており、以下の場合に自動的にデータを削除します。</p>
          <ul>
            <li><strong>アプリのアンインストール:</strong> すべてのマーチャントデータを削除</li>
            <li><strong>ストアの削除:</strong> すべてのマーチャントデータを削除</li>
            <li><strong>カスタマーデータ削除要求:</strong> 該当するエンドカスタマーのIPキャッシュを削除</li>
            <li><strong>カスタマーデータ閲覧要求:</strong> 該当するエンドカスタマーのIPキャッシュ情報を提供</li>
          </ul>
        </Subsection>
      </Section>

      <Section title="8. GDPR・個人情報保護法への対応">
        <p>
          運営者は、GDPR（EU一般データ保護規則）および日本の個人情報保護法を含む、適用されるすべてのプライバシー法規を遵守します。
        </p>
        <ul>
          <li>EEA（欧州経済領域）のマーチャント・カスタマーのデータは、GDPR要件に従って処理されます</li>
          <li>データ主体の権利（アクセス権、訂正権、削除権、データポータビリティ権など）を尊重します</li>
          <li>IPアドレスは都道府県レベルの地域推定にのみ使用され、個人の特定には使用されません</li>
        </ul>
      </Section>

      <Section title="9. クッキー・トラッキング技術">
        <p>
          本アプリは、ストアフロント上でクッキーやトラッキング技術を使用しません。
          配送予定日の表示は、リクエストごとにIPアドレスから地域を推定して行われますが、個人の追跡や識別は行いません。
        </p>
      </Section>

      <Section title="10. 子どものプライバシー">
        <p>本アプリは、13歳未満の子どもから意図的に個人情報を収集しません。</p>
      </Section>

      <Section title="11. プライバシーポリシーの変更">
        <p>
          運営者は、本プライバシーポリシーを随時更新する場合があります。
          重要な変更がある場合は、マーチャントにメールまたはアプリ内通知で通知します。
        </p>
      </Section>

      <Section title="12. お問い合わせ">
        <p>プライバシーに関するご質問・ご要望は、以下までご連絡ください。</p>
        <ul>
          <li>メールアドレス: h83688215@gmail.com</li>
        </ul>
      </Section>

      <div style={{
        marginTop: "60px",
        paddingTop: "20px",
        borderTop: "1px solid #e5e8eb",
        fontSize: "14px",
        color: "#666",
        textAlign: "center"
      }}>
        このプライバシーポリシーは、Shopifyアプリストア要件およびGDPR・個人情報保護法の要件を満たすよう作成されています。
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section style={{ marginBottom: "40px" }}>
      <h2 style={{
        fontSize: "24px",
        fontWeight: "600",
        marginBottom: "16px",
        color: "#1a1a1a",
        paddingBottom: "8px",
        borderBottom: "2px solid #e5e8eb"
      }}>
        {title}
      </h2>
      <div style={{ fontSize: "16px" }}>
        {children}
      </div>
    </section>
  );
}

function Subsection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ marginTop: "20px", marginBottom: "20px" }}>
      <h3 style={{
        fontSize: "18px",
        fontWeight: "600",
        marginBottom: "12px",
        color: "#2c3e50"
      }}>
        {title}
      </h3>
      <div>
        {children}
      </div>
    </div>
  );
}
