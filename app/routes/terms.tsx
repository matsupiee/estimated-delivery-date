import { CONTACT_EMAIL_TO } from "app/lib/constants";

export default function Terms() {
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
        利用規約
      </h1>
      <p style={{ color: "#666", marginBottom: "40px" }}>
        最終更新日: 2025年11月30日
      </p>

      <p style={{ marginBottom: "30px" }}>
        本利用規約（以下「本規約」）は、個人開発者（以下「運営者」）が提供するShopifyアプリ「配送予定日計算」（以下「本アプリ」）の利用条件を定めるものです。本アプリをインストール・利用することにより、本規約に同意したものとみなされます。
      </p>

      <Section title="1. 定義">
        <p>本規約において使用する用語の定義は、以下の通りとします。</p>
        <ul>
          <li><strong>本アプリ:</strong> 運営者が提供する「配送予定日計算」Shopifyアプリおよび関連サービス</li>
          <li><strong>ユーザー:</strong> 本アプリをインストール・利用するShopifyストアのオーナーまたは管理者</li>
          <li><strong>エンドカスタマー:</strong> ユーザーのShopifyストアを訪問・利用する顧客</li>
          <li><strong>Shopify:</strong> Shopify Inc.が提供するEコマースプラットフォーム</li>
        </ul>
      </Section>

      <Section title="2. アプリの利用許諾">
        <Subsection title="2.1 ライセンスの付与">
          <p>
            運営者は、ユーザーに対し、本規約に従い本アプリを利用する非独占的、譲渡不可、サブライセンス不可の権利を付与します。
          </p>
        </Subsection>

        <Subsection title="2.2 利用条件">
          <p>ユーザーは、以下の条件を遵守するものとします。</p>
          <ul>
            <li>Shopifyの利用規約およびポリシーを遵守すること</li>
            <li>本アプリを商業目的で適切に利用すること</li>
            <li>本アプリの機能を不正に改変・解析しないこと</li>
          </ul>
        </Subsection>
      </Section>

      <Section title="3. ユーザーの責任">
        <Subsection title="3.1 アカウント管理">
          <p>ユーザーは、自身のShopifyアカウントおよび本アプリの設定を適切に管理する責任を負います。</p>
        </Subsection>

        <Subsection title="3.2 設定の正確性">
          <p>
            ユーザーは、本アプリで設定する情報（準備日数、配送日数、休業日など）の正確性について責任を負います。運営者は、ユーザーが設定した情報の正確性について一切の責任を負いません。
          </p>
        </Subsection>

        <Subsection title="3.3 エンドカスタマーへの対応">
          <p>
            本アプリが表示する配送予定日はあくまで推定値です。実際の配送日時について、ユーザーはエンドカスタマーに対して責任を負います。
          </p>
        </Subsection>
      </Section>

      <Section title="4. 禁止事項">
        <p>ユーザーは、以下の行為を行ってはなりません。</p>
        <ul>
          <li>本アプリを法令に違反する目的で利用すること</li>
          <li>本アプリのセキュリティを侵害する行為</li>
          <li>本アプリのリバースエンジニアリング、逆コンパイル、逆アセンブル</li>
          <li>本アプリの機能を回避・妨害する行為</li>
          <li>本アプリの信用を毀損する行為</li>
          <li>運営者または第三者の知的財産権を侵害する行為</li>
          <li>その他、運営者が不適切と判断する行為</li>
        </ul>
      </Section>

      <Section title="5. 料金・支払い">
        <Subsection title="5.1 料金プラン">
          <p>本アプリの料金プランは、Shopifyアプリストアまたは本アプリの管理画面に表示されます。</p>
        </Subsection>

        <Subsection title="5.2 支払い">
          <p>料金の支払いは、Shopifyの課金システムを通じて行われます。支払いに関する条件は、Shopifyの利用規約に従います。</p>
        </Subsection>

        <Subsection title="5.3 返金">
          <p>
            サブスクリプション料金の返金は、原則として行いません。ただし、運営者が特別に認めた場合はこの限りではありません。
          </p>
        </Subsection>
      </Section>

      <Section title="6. サービスの提供">
        <Subsection title="6.1 サービスの変更">
          <p>
            運営者は、ユーザーへの事前通知なく、本アプリの機能を追加・変更・削除することができます。ただし、重要な変更については、可能な限り事前にユーザーに通知するよう努めます。
          </p>
        </Subsection>

        <Subsection title="6.2 サービスの中断・停止">
          <p>運営者は、以下の場合、ユーザーへの事前通知なく本アプリの提供を一時的に中断または停止することができます。</p>
          <ul>
            <li>システムの保守・メンテナンスを行う場合</li>
            <li>システムに障害が発生した場合</li>
            <li>天災地変その他の不可抗力により提供が困難な場合</li>
            <li>Shopifyのサービスが停止した場合</li>
          </ul>
        </Subsection>

        <Subsection title="6.3 サービスの終了">
          <p>運営者は、30日前までにユーザーに通知することにより、本アプリの提供を終了することができます。</p>
        </Subsection>

        <Subsection title="6.4 損害の免責">
          <p>
            本アプリのサービスの変更・中断・停止・終了により、ユーザーまたは第三者に損害（データの損失、売上機会の喪失、ビジネスの中断など）が生じた場合でも、運営者は一切の責任を負いません。ユーザーは、自己の責任においてデータのバックアップ等の必要な対策を講じるものとします。
          </p>
        </Subsection>
      </Section>

      <Section title="7. 知的財産権">
        <Subsection title="7.1 権利の帰属">
          <p>
            本アプリに関する一切の知的財産権は、運営者または正当な権利者に帰属します。本規約に基づく本アプリの利用許諾は、本アプリに関する知的財産権の譲渡を意味するものではありません。
          </p>
        </Subsection>

        <Subsection title="7.2 フィードバック">
          <p>
            ユーザーが運営者に対して本アプリに関する意見・要望・改善提案（以下「フィードバック」）を提供した場合、運営者は当該フィードバックを無償で自由に利用できるものとします。
          </p>
        </Subsection>
      </Section>

      <Section title="8. データの取り扱い">
        <p>
          本アプリにおけるデータの収集・利用・保存については、別途定める
          <a href="/privacy" style={{ color: "#0066cc", textDecoration: "none", borderBottom: "1px solid #0066cc" }}>プライバシーポリシー</a>
          に従います。
        </p>
      </Section>

      <Section title="9. 免責事項">
        <Subsection title="9.1 サービスの保証">
          <p>運営者は、本アプリについて、以下の事項を保証しません。</p>
          <ul>
            <li>本アプリがユーザーの特定の目的に適合すること</li>
            <li>本アプリに瑕疵・エラー・バグが存在しないこと</li>
            <li>本アプリの提供が中断されないこと</li>
            <li>本アプリから得られる情報の正確性・完全性・有用性</li>
          </ul>
        </Subsection>

        <Subsection title="9.2 配送予定日の正確性">
          <p>
            本アプリが計算・表示する配送予定日は、ユーザーが設定した情報に基づく推定値です。運営者は、表示される配送予定日の正確性について一切保証せず、実際の配送日時との相違について責任を負いません。
          </p>
        </Subsection>

        <Subsection title="9.3 第三者サービス">
          <p>
            本アプリは、MaxMind GeoLiteなどの第三者サービスを利用しています。運営者は、これらの第三者サービスの正確性・可用性について保証せず、責任を負いません。また、第三者サービスの停止・仕様変更・機能制限等により本アプリが正常に動作しない場合、または本アプリの一部機能が利用できなくなった場合でも、運営者は一切の責任を負いません。
          </p>
        </Subsection>

        <Subsection title="9.4 ユーザー設定の誤り">
          <p>
            運営者は、ユーザーが本アプリで行った設定内容の誤り、不備、入力ミス、または設定の遅延・漏れ等に起因して発生した損害（配送予定日の誤表示、エンドカスタマーからのクレーム、信用の毀損など）について、一切の責任を負いません。ユーザーは、設定内容の正確性を自ら確認し、適切に管理する責任を負います。
          </p>
        </Subsection>
      </Section>

      <Section title="10. 責任の制限">
        <Subsection title="10.1 損害賠償の制限">
          <p>
            運営者は、本アプリの利用に関連してユーザーまたは第三者に生じた損害（データの損失、利益の損失、業務の中断など）について、運営者に故意または重過失がある場合を除き、一切の責任を負いません。
          </p>
        </Subsection>

        <Subsection title="10.2 賠償額の上限">
          <p>
            運営者がユーザーに対して損害賠償責任を負う場合、その賠償額は、ユーザーが本アプリについて過去12ヶ月間に支払った料金の総額を上限とします。
          </p>
        </Subsection>
      </Section>

      <Section title="11. 利用停止・アカウント削除">
        <Subsection title="11.1 利用停止">
          <p>運営者は、ユーザーが以下のいずれかに該当する場合、事前通知なく本アプリの利用を停止することができます。</p>
          <ul>
            <li>本規約に違反した場合</li>
            <li>料金の支払いを怠った場合</li>
            <li>Shopifyから利用停止の要請があった場合</li>
            <li>その他、運営者が不適切と判断した場合</li>
          </ul>
        </Subsection>

        <Subsection title="11.2 アンインストール">
          <p>
            ユーザーは、いつでも本アプリをアンインストールすることができます。アンインストール後も、未払いの料金がある場合は支払い義務が存続します。
          </p>
        </Subsection>
      </Section>

      <Section title="12. 準拠法・管轄裁判所">
        <p>
          本規約は、日本法に準拠して解釈されます。本アプリに関連して紛争が生じた場合、東京地方裁判所を第一審の専属的合意管轄裁判所とします。
        </p>
      </Section>

      <Section title="13. 規約の変更">
        <p>
          運営者は、必要に応じて本規約を変更することができます。変更後の規約は、本アプリ内または運営者が指定する方法で通知し、通知後にユーザーが本アプリを継続して利用した場合、変更後の規約に同意したものとみなします。
        </p>
      </Section>

      <Section title="14. 分離可能性">
        <p>
          本規約のいずれかの条項が法令により無効または執行不能と判断された場合でも、他の条項は引き続き有効に存続します。
        </p>
      </Section>

      <Section title="15. 譲渡禁止">
        <p>
          ユーザーは、運営者の事前の書面による同意なく、本規約上の地位または権利義務を第三者に譲渡することはできません。
        </p>
      </Section>

      <Section title="16. お問い合わせ">
        <p>本規約に関するご質問は、以下までご連絡ください。</p>
        <ul>
          <li>メールアドレス: {CONTACT_EMAIL_TO}</li>
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
        この利用規約は、Shopifyアプリストア要件および日本法を考慮して作成されています。
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
