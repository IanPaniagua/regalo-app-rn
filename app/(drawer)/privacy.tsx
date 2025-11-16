import { ScrollView, StyleSheet, Linking, Pressable } from 'react-native';
import { AppContainer } from '@/src/components/ui/AppContainer';
import { AppTitle } from '@/src/components/ui/AppTitle';
import { AppText } from '@/src/components/ui/AppText';

export default function PrivacyScreen() {
  return (
    <AppContainer>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <AppTitle>Privacy Policy</AppTitle>

        <Pressable onPress={() => Linking.openURL('https://regaloapp.com/privacy-policy-app')}>
          <AppText style={styles.link}>
            Full Privacy Policy (web): https://app-regalo.vercel.app/privacy-policy-app
          </AppText>
        </Pressable>

        <AppText style={styles.updatedAt}>Last updated: 16 November 2025</AppText>

        <AppText style={styles.sectionTitle}>1. Data Controller</AppText>
        <AppText style={styles.paragraph}>
          The data controller for this app ("RegaloApp") is:
          {'\n'}
          {'\n'}Ian Manuel Paniagua Porroa
          {'\n'}Beim Andreasbrunnen 6
          {'\n'}20249 Hamburg, Germany
          {'\n'}Email: paniagua.ian.de@gmail.com
          {'\n'}Phone: +49 176 10816765
        </AppText>

        <AppText style={styles.sectionTitle}>2. Data We Collect</AppText>
        <AppText style={styles.paragraph}>
          We collect and process the following types of personal data when you use RegaloApp:
          {'\n'}• Account and authentication data (email, password managed by Firebase Auth, Firebase UID)
          {'\n'}• Profile data (name, date of birth, hobbies, avatar)
          {'\n'}• Connections and usage data inside the app (contacts, invitations, statistics)
          {'\n'}• Push notification data (Firebase Cloud Messaging token of your device)
          {'\n'}• Technical data such as logs, error reports and anonymous identifiers
        </AppText>

        <AppText style={styles.sectionTitle}>3. Purposes of Processing</AppText>
        <AppText style={styles.paragraph}>
          We use your data for the following purposes:
          {'\n'}• To create and manage your RegaloApp account
          {'\n'}• To authenticate you and allow secure login
          {'\n'}• To show and manage birthdays, reminders and connections in the calendar
          {'\n'}• To send push notifications about reminders, invitations or relevant changes
          {'\n'}• To maintain and improve the app, fix bugs and analyse usage on a technical level
          {'\n'}• To comply with legal obligations that may apply to us
        </AppText>

        <AppText style={styles.sectionTitle}>4. Legal Basis</AppText>
        <AppText style={styles.paragraph}>
          We process your personal data on the following legal bases (under the GDPR):
          {'\n'}• Performance of a contract (Art. 6(1)(b)) – to provide you with the RegaloApp service
          {'\n'}• Legitimate interest (Art. 6(1)(f)) – to improve the app, prevent abuse and ensure security
          {'\n'}• Consent (Art. 6(1)(a)) – for certain notifications or optional features where required
        </AppText>

        <AppText style={styles.sectionTitle}>5. Third-Party Services and Location of Data</AppText>
        <AppText style={styles.paragraph}>
          RegaloApp uses Firebase from Google as the main backend provider. The following Firebase services
          are used: Authentication, Cloud Firestore and Cloud Messaging.
          {'\n'}
          {'\n'}Data is hosted on Google Cloud Platform servers in the region europe-west3 (Frankfurt, Germany).
          This means your data is stored within the European Union. Google may perform international data
          transfers under appropriate safeguards such as the EU Standard Contractual Clauses.
        </AppText>

        <AppText style={styles.sectionTitle}>6. Data Retention</AppText>
        <AppText style={styles.paragraph}>
          We keep your personal data for as long as your RegaloApp account is active and for the time
          necessary to comply with legal obligations or resolve disputes. When you request deletion of
          your account, your personal data will be securely deleted or anonymised, except where we are
          legally required to retain it.
        </AppText>

        <AppText style={styles.sectionTitle}>7. Your Rights</AppText>
        <AppText style={styles.paragraph}>
          Under applicable data protection laws (including the GDPR), you have the right to:
          {'\n'}• Access your personal data
          {'\n'}• Rectify inaccurate or incomplete data
          {'\n'}• Erase your data (where legally possible)
          {'\n'}• Restrict processing in certain circumstances
          {'\n'}• Object to processing based on legitimate interests
          {'\n'}• Request data portability
          {'\n'}
          {'\n'}To exercise these rights, you can contact:
          {'\n'}Email: paniagua.ian.de@gmail.com
          {'\n'}Phone: +49 176 10816765
          {'\n'}Address: Beim Andreasbrunnen 6, 20249 Hamburg, Germany
        </AppText>

        <AppText style={styles.sectionTitle}>8. Security</AppText>
        <AppText style={styles.paragraph}>
          We apply reasonable technical and organisational measures to protect your data against
          unauthorised access, accidental loss, misuse or alteration. However, no system is completely
          secure and we cannot guarantee absolute security of data transmitted over the internet.
        </AppText>

        <AppText style={styles.sectionTitle}>9. Children</AppText>
        <AppText style={styles.paragraph}>
          RegaloApp is not directed at children under the age of 16. If we become aware that we have
          collected personal data from a child without appropriate consent, we will take steps to delete
          such information.
        </AppText>

        <AppText style={styles.sectionTitle}>10. Changes to this Policy</AppText>
        <AppText style={styles.paragraph}>
          We may update this Privacy Policy from time to time to reflect changes in the app or in
          applicable regulations. When we make significant changes, we may notify you within the app.
          The date of the latest update will always be shown at the top of this page.
        </AppText>

        <AppText style={styles.sectionTitle}>11. Contact</AppText>
        <AppText style={styles.paragraph}>
          If you have any questions about this Privacy Policy or how we process your personal data,
          you can contact:
          {'\n'}
          {'\n'}Ian Manuel Paniagua Porroa
          {'\n'}Email: paniagua.ian.de@gmail.com
          {'\n'}Phone: +49 176 10816765
          {'\n'}Address: Beim Andreasbrunnen 6, 20249 Hamburg, Germany
        </AppText>
      </ScrollView>
    </AppContainer>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingVertical: 16,
    gap: 12,
  },
  link: {
    textDecorationLine: 'underline',
    marginBottom: 12,
  },
  updatedAt: {
    marginTop: 8,
    marginBottom: 8,
    fontSize: 12,
    opacity: 0.8,
  },
  sectionTitle: {
    marginTop: 16,
    fontWeight: '700',
  },
  paragraph: {
    marginTop: 4,
    lineHeight: 20,
  },
});
