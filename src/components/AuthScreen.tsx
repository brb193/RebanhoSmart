import { useMemo, useState } from 'react';
import {
  AlertTriangle,
  CheckCircle2,
  Eye,
  EyeOff,
  Lock,
  Mail,
  ShieldCheck,
  Sprout,
  User,
  XCircle,
} from 'lucide-react-native';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { colors, fonts } from '../theme';
import { FormInput } from './FormInput';

type AuthTab = 'login' | 'register';
type AlertKind = 'error' | 'success' | 'warning';
type RegisterField = 'confirmPassword' | 'email' | 'name' | 'password';
type LoginField = 'email' | 'password';

interface RegisterFormState {
  confirmPassword: string;
  email: string;
  name: string;
  password: string;
}

interface LoginFormState {
  email: string;
  password: string;
}

interface AlertState {
  kind: AlertKind;
  message: string;
  title: string;
}

interface AuthScreenProps {
  onSuccess?: () => void;
}

const INITIAL_REGISTER_FORM: RegisterFormState = {
  confirmPassword: '',
  email: '',
  name: '',
  password: '',
};

const INITIAL_LOGIN_FORM: LoginFormState = {
  email: '',
  password: '',
};

const LOCAL_EXISTING_EMAIL = 'produtor@fazenda.com.br';

export function AuthScreen({ onSuccess }: AuthScreenProps) {
  const [activeTab, setActiveTab] = useState<AuthTab>('register');
  const [registerForm, setRegisterForm] = useState<RegisterFormState>(INITIAL_REGISTER_FORM);
  const [loginForm, setLoginForm] = useState<LoginFormState>(INITIAL_LOGIN_FORM);
  const [registerAlert, setRegisterAlert] = useState<AlertState | null>(null);
  const [loginAlert, setLoginAlert] = useState<AlertState | null>(null);
  const [focusedField, setFocusedField] = useState<RegisterField | LoginField | null>(null);
  const [showRegisterPassword, setShowRegisterPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showLoginPassword, setShowLoginPassword] = useState(false);

  const liveRegisterAlert = useMemo<AlertState | null>(() => {
    const normalizedEmail = registerForm.email.trim().toLowerCase();

    if (normalizedEmail === LOCAL_EXISTING_EMAIL) {
      return {
        kind: 'error',
        title: 'Aviso de validação',
        message: 'Este e-mail já está cadastrado no sistema. Faça login ou use outro e-mail.',
      };
    }

    if (registerForm.confirmPassword && registerForm.password !== registerForm.confirmPassword) {
      return {
        kind: 'warning',
        title: 'Aviso de validação',
        message: 'As senhas informadas não coincidem. Digite novamente.',
      };
    }

    if (registerForm.password && registerForm.password.length < 8) {
      return {
        kind: 'warning',
        title: 'Aviso de validação',
        message: 'A senha deve ter no mínimo 8 caracteres.',
      };
    }

    return registerAlert;
  }, [registerAlert, registerForm.confirmPassword, registerForm.email, registerForm.password]);

  function changeTab(nextTab: AuthTab) {
    setActiveTab(nextTab);
    setFocusedField(null);
    setRegisterAlert(null);
    setLoginAlert(null);
  }

  function updateRegisterField(field: RegisterField, value: string) {
    setRegisterForm((current) => ({ ...current, [field]: value }));
    setRegisterAlert(null);
  }

  function updateLoginField(field: LoginField, value: string) {
    setLoginForm((current) => ({ ...current, [field]: value }));
    setLoginAlert(null);
  }

  function handleRegister() {
    const normalizedEmail = registerForm.email.trim().toLowerCase();

    if (!registerForm.name.trim() || !normalizedEmail || !registerForm.password || !registerForm.confirmPassword) {
      setRegisterAlert({
        kind: 'warning',
        title: 'Confira os dados',
        message: 'Preencha todos os campos para criar sua conta.',
      });
      return;
    }

    if (normalizedEmail === LOCAL_EXISTING_EMAIL || registerForm.password.length < 8 || registerForm.password !== registerForm.confirmPassword) {
      return;
    }

    setRegisterAlert({
      kind: 'success',
      title: 'Conta criada com sucesso',
      message: 'Seus dados estão prontos para acessar o rebanho.',
    });
    onSuccess?.();
  }

  function handleLogin() {
    if (!loginForm.email.trim() || !loginForm.password) {
      setLoginAlert({
        kind: 'error',
        title: 'Acesso não autorizado',
        message: 'Acesso não autorizado. Verifique suas credenciais e tente novamente.',
      });
      return;
    }

    setLoginAlert({
      kind: 'success',
      title: 'Acesso confirmado',
      message: 'Tudo certo. Abrindo os dados do seu rebanho.',
    });
    onSuccess?.();
  }

  function testPasswordMismatch() {
    setRegisterForm((current) => ({
      ...current,
      password: 'Manejo2026',
      confirmPassword: 'Campo2026',
    }));
    setRegisterAlert(null);
  }

  function testExistingEmail() {
    setRegisterForm((current) => ({
      ...current,
      email: LOCAL_EXISTING_EMAIL,
    }));
    setRegisterAlert(null);
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView behavior={Platform.select({ ios: 'padding', default: undefined })} style={styles.flex}>
        <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
          <View style={styles.phoneFrame}>
            <View style={styles.brandHeader}>
              <View style={styles.brandRow}>
                <View style={styles.logoMark}>
                  <Sprout color={colors.white} size={23} strokeWidth={2.5} />
                </View>
                <View>
                  <Text style={styles.brandName}>RebanhoSmart</Text>
                  <View style={styles.fieldBadge}>
                    <Text style={styles.fieldBadgeText}>CAMPO</Text>
                  </View>
                </View>
              </View>
              <Text style={styles.brandDescription}>
                Aplicativo para acompanhamento de animais, manejos, pesagens, alertas e consultas sobre os dados do rebanho.
              </Text>
            </View>

            <View accessibilityRole="tablist" style={styles.tabList}>
              <Pressable
                accessibilityRole="tab"
                accessibilityState={{ selected: activeTab === 'login' }}
                onPress={() => changeTab('login')}
                style={({ pressed }) => [styles.tab, activeTab === 'login' && styles.tabActive, pressed && styles.pressed]}
              >
                <Text style={[styles.tabText, activeTab === 'login' && styles.tabTextActive]}>Entrar</Text>
              </Pressable>
              <Pressable
                accessibilityRole="tab"
                accessibilityState={{ selected: activeTab === 'register' }}
                onPress={() => changeTab('register')}
                style={({ pressed }) => [styles.tab, activeTab === 'register' && styles.tabActive, pressed && styles.pressed]}
              >
                <Text style={[styles.tabText, activeTab === 'register' && styles.tabTextActive]}>Criar conta</Text>
              </Pressable>
            </View>

            {activeTab === 'register' ? (
              <View style={styles.content}>
                <View style={styles.sectionIntro}>
                  <Text style={styles.title}>Criar sua conta</Text>
                  <Text style={styles.subtitle}>Acesso individual e exclusivo ao rebanho</Text>
                </View>

                {liveRegisterAlert ? <FeedbackAlert alert={liveRegisterAlert} /> : null}

                <View style={styles.form}>
                  <FormInput
                    autoCapitalize="words"
                    autoComplete="name"
                    focused={focusedField === 'name'}
                    icon={<User color={colors.primary} size={20} />}
                    label="Nome completo"
                    onBlur={() => setFocusedField(null)}
                    onChangeText={(value) => updateRegisterField('name', value)}
                    onFocus={() => setFocusedField('name')}
                    placeholder="Ex: João da Silva"
                    returnKeyType="next"
                    value={registerForm.name}
                  />
                  <FormInput
                    autoCapitalize="none"
                    autoComplete="email"
                    focused={focusedField === 'email'}
                    icon={<Mail color={colors.primary} size={20} />}
                    keyboardType="email-address"
                    label="E-mail"
                    onBlur={() => setFocusedField(null)}
                    onChangeText={(value) => updateRegisterField('email', value)}
                    onFocus={() => setFocusedField('email')}
                    placeholder="produtor@fazenda.com.br"
                    value={registerForm.email}
                  />
                  <FormInput
                    accessory={
                      <VisibilityButton
                        hidden={!showRegisterPassword}
                        onPress={() => setShowRegisterPassword((visible) => !visible)}
                      />
                    }
                    autoComplete="new-password"
                    focused={focusedField === 'password'}
                    helperText="Mínimo 8 caracteres"
                    icon={<Lock color={colors.primary} size={20} />}
                    label="Senha"
                    onBlur={() => setFocusedField(null)}
                    onChangeText={(value) => updateRegisterField('password', value)}
                    onFocus={() => setFocusedField('password')}
                    placeholder="Defina sua senha"
                    secureTextEntry={!showRegisterPassword}
                    value={registerForm.password}
                  />
                  <FormInput
                    accessory={
                      <VisibilityButton
                        hidden={!showConfirmPassword}
                        onPress={() => setShowConfirmPassword((visible) => !visible)}
                      />
                    }
                    autoComplete="new-password"
                    focused={focusedField === 'confirmPassword'}
                    icon={<Lock color={colors.primary} size={20} />}
                    label="Confirmar senha"
                    onBlur={() => setFocusedField(null)}
                    onChangeText={(value) => updateRegisterField('confirmPassword', value)}
                    onFocus={() => setFocusedField('confirmPassword')}
                    placeholder="Repita a senha definida"
                    secureTextEntry={!showConfirmPassword}
                    value={registerForm.confirmPassword}
                  />
                </View>

                <PrimaryButton icon={<CheckCircle2 color={colors.white} size={20} />} label="Criar Conta e Acessar" onPress={handleRegister} />

                <View style={styles.validationCard}>
                  <Text style={styles.cardTitle}>Seus dados, sempre conferidos</Text>
                  <ValidationRule text="E-mails repetidos são bloqueados para proteger sua conta." />
                  <ValidationRule text="A confirmação avisa na hora se as senhas forem diferentes." />
                  <ValidationRule text="A senha precisa ter pelo menos 8 caracteres." />
                  <View style={styles.testActions}>
                    <SecondaryButton label="Testar: Senhas Divergentes" onPress={testPasswordMismatch} />
                    <SecondaryButton label="Testar: E-mail Já Cadastrado" onPress={testExistingEmail} />
                  </View>
                </View>
              </View>
            ) : (
              <View style={styles.content}>
                <View style={styles.sectionIntro}>
                  <Text style={styles.title}>Acessar Conta</Text>
                  <Text style={styles.subtitle}>Informe suas credenciais para gerenciar seu rebanho</Text>
                </View>

                {loginAlert ? <FeedbackAlert alert={loginAlert} /> : null}

                <View style={styles.form}>
                  <FormInput
                    autoCapitalize="none"
                    autoComplete="email"
                    focused={focusedField === 'email'}
                    icon={<Mail color={colors.primary} size={20} />}
                    keyboardType="email-address"
                    label="E-mail"
                    onBlur={() => setFocusedField(null)}
                    onChangeText={(value) => updateLoginField('email', value)}
                    onFocus={() => setFocusedField('email')}
                    placeholder="seu@email.com"
                    value={loginForm.email}
                  />
                  <FormInput
                    accessory={
                      <VisibilityButton
                        hidden={!showLoginPassword}
                        onPress={() => setShowLoginPassword((visible) => !visible)}
                      />
                    }
                    autoComplete="current-password"
                    focused={focusedField === 'password'}
                    icon={<Lock color={colors.primary} size={20} />}
                    label="Senha"
                    onBlur={() => setFocusedField(null)}
                    onChangeText={(value) => updateLoginField('password', value)}
                    onFocus={() => setFocusedField('password')}
                    placeholder="Sua senha"
                    secureTextEntry={!showLoginPassword}
                    value={loginForm.password}
                  />
                </View>

                <PrimaryButton icon={<CheckCircle2 color={colors.white} size={20} />} label="Entrar no RebanhoSmart" onPress={handleLogin} />
                <SecondaryButton label="Simular Credenciais Inválidas" onPress={() => setLoginAlert({
                  kind: 'error',
                  title: 'Acesso não autorizado',
                  message: 'Acesso não autorizado. Verifique suas credenciais e tente novamente.',
                })} />
              </View>
            )}

            <View style={styles.privacyCard}>
              <View style={styles.privacyIcon}>
                <ShieldCheck color={colors.primary} size={22} strokeWidth={2.4} />
              </View>
              <View style={styles.privacyCopy}>
                <Text style={styles.privacyTitle}>Privacidade Garantida</Text>
                <Text style={styles.privacyText}>Cada produtor acessa exclusivamente os dados associados à sua própria conta de rebanho.</Text>
              </View>
            </View>

            <Text style={styles.signature}>Módulo Seguro de Campo • AgroField Realism</Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function FeedbackAlert({ alert }: { alert: AlertState }) {
  const alertStyles = alert.kind === 'success' ? styles.successAlert : alert.kind === 'error' ? styles.errorAlert : styles.warningAlert;
  const iconColor = alert.kind === 'success' ? colors.success : alert.kind === 'error' ? colors.error : colors.warning;
  const Icon = alert.kind === 'success' ? CheckCircle2 : alert.kind === 'error' ? XCircle : AlertTriangle;

  return (
    <View accessibilityLiveRegion="polite" style={[styles.alert, alertStyles]}>
      <Icon color={iconColor} size={21} strokeWidth={2.4} />
      <View style={styles.alertCopy}>
        <Text style={[styles.alertTitle, { color: iconColor }]}>{alert.title}</Text>
        <Text style={[styles.alertText, { color: iconColor }]}>{alert.message}</Text>
      </View>
    </View>
  );
}

function VisibilityButton({ hidden, onPress }: { hidden: boolean; onPress: () => void }) {
  return (
    <Pressable accessibilityLabel={hidden ? 'Mostrar senha' : 'Ocultar senha'} hitSlop={8} onPress={onPress} style={({ pressed }) => pressed && styles.iconPressed}>
      {hidden ? <Eye color={colors.muted} size={21} /> : <EyeOff color={colors.muted} size={21} />}
    </Pressable>
  );
}

function PrimaryButton({ icon, label, onPress }: { icon: React.ReactNode; label: string; onPress: () => void }) {
  return (
    <Pressable accessibilityRole="button" onPress={onPress} style={({ pressed }) => [styles.primaryButton, pressed && styles.primaryButtonPressed]}>
      {icon}
      <Text style={styles.primaryButtonText}>{label}</Text>
    </Pressable>
  );
}

function SecondaryButton({ label, onPress }: { label: string; onPress: () => void }) {
  return (
    <Pressable accessibilityRole="button" onPress={onPress} style={({ pressed }) => [styles.secondaryButton, pressed && styles.pressed]}>
      <Text style={styles.secondaryButtonText}>{label}</Text>
    </Pressable>
  );
}

function ValidationRule({ text }: { text: string }) {
  return (
    <View style={styles.validationRule}>
      <CheckCircle2 color={colors.success} size={18} strokeWidth={2.3} />
      <Text style={styles.validationText}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  alert: {
    alignItems: 'flex-start',
    borderRadius: 10,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 10,
    padding: 13,
  },
  alertCopy: {
    flex: 1,
    gap: 2,
  },
  alertText: {
    fontFamily: fonts.regular,
    fontSize: 14,
    lineHeight: 20,
  },
  alertTitle: {
    fontFamily: fonts.bold,
    fontSize: 15,
    lineHeight: 21,
  },
  brandDescription: {
    color: colors.muted,
    fontFamily: fonts.regular,
    fontSize: 16,
    lineHeight: 23,
    marginTop: 17,
  },
  brandHeader: {
    paddingHorizontal: 24,
    paddingTop: 28,
  },
  brandName: {
    color: colors.text,
    fontFamily: fonts.bold,
    fontSize: 23,
    letterSpacing: -0.5,
    lineHeight: 28,
  },
  brandRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 11,
  },
  cardTitle: {
    color: colors.text,
    fontFamily: fonts.semibold,
    fontSize: 16,
    lineHeight: 22,
    marginBottom: 13,
  },
  content: {
    gap: 20,
    paddingHorizontal: 24,
    paddingTop: 26,
  },
  errorAlert: {
    backgroundColor: colors.errorBackground,
    borderColor: colors.errorBorder,
  },
  fieldBadge: {
    alignSelf: 'flex-start',
    backgroundColor: colors.primarySoft,
    borderRadius: 5,
    marginTop: 3,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  fieldBadgeText: {
    color: colors.primary,
    fontFamily: fonts.bold,
    fontSize: 10,
    letterSpacing: 1.05,
    lineHeight: 13,
  },
  flex: {
    flex: 1,
  },
  form: {
    gap: 17,
  },
  iconPressed: {
    opacity: 0.6,
  },
  logoMark: {
    alignItems: 'center',
    backgroundColor: colors.primary,
    borderRadius: 12,
    height: 46,
    justifyContent: 'center',
    width: 46,
  },
  phoneFrame: {
    backgroundColor: colors.page,
    flex: 1,
    maxWidth: 390,
    minHeight: 844,
    width: '100%',
  },
  pressed: {
    opacity: 0.78,
  },
  primaryButton: {
    alignItems: 'center',
    backgroundColor: colors.primary,
    borderRadius: 11,
    flexDirection: 'row',
    gap: 9,
    justifyContent: 'center',
    minHeight: 52,
    paddingHorizontal: 18,
  },
  primaryButtonPressed: {
    backgroundColor: colors.primaryActive,
    transform: [{ scale: 0.99 }],
  },
  primaryButtonText: {
    color: colors.white,
    fontFamily: fonts.semibold,
    fontSize: 16,
    lineHeight: 22,
  },
  privacyCard: {
    alignItems: 'flex-start',
    backgroundColor: colors.primarySoft,
    borderColor: '#B9D7BC',
    borderRadius: 12,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 12,
    marginHorizontal: 24,
    marginTop: 30,
    padding: 15,
  },
  privacyCopy: {
    flex: 1,
    gap: 3,
  },
  privacyIcon: {
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: 20,
    height: 38,
    justifyContent: 'center',
    width: 38,
  },
  privacyText: {
    color: colors.muted,
    fontFamily: fonts.regular,
    fontSize: 14,
    lineHeight: 20,
  },
  privacyTitle: {
    color: colors.primary,
    fontFamily: fonts.bold,
    fontSize: 16,
    lineHeight: 22,
  },
  safeArea: {
    backgroundColor: colors.page,
    flex: 1,
  },
  scrollContent: {
    alignItems: 'center',
    flexGrow: 1,
  },
  sectionIntro: {
    gap: 4,
  },
  secondaryButton: {
    alignItems: 'center',
    backgroundColor: colors.white,
    borderColor: colors.border,
    borderRadius: 9,
    borderWidth: 1,
    justifyContent: 'center',
    minHeight: 52,
    paddingHorizontal: 12,
  },
  secondaryButtonText: {
    color: colors.primary,
    fontFamily: fonts.semibold,
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
  },
  signature: {
    color: colors.muted,
    fontFamily: fonts.medium,
    fontSize: 12,
    letterSpacing: 0.1,
    lineHeight: 18,
    marginBottom: 26,
    marginTop: 17,
    textAlign: 'center',
  },
  subtitle: {
    color: colors.muted,
    fontFamily: fonts.regular,
    fontSize: 16,
    lineHeight: 23,
  },
  successAlert: {
    backgroundColor: colors.successBackground,
    borderColor: colors.successBorder,
  },
  tab: {
    alignItems: 'center',
    borderRadius: 9,
    flex: 1,
    justifyContent: 'center',
    minHeight: 48,
    paddingHorizontal: 10,
  },
  tabActive: {
    backgroundColor: colors.white,
    elevation: 1,
    shadowColor: '#1E293B',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.12,
    shadowRadius: 2,
  },
  tabList: {
    backgroundColor: '#E8EDF7',
    borderRadius: 11,
    flexDirection: 'row',
    marginHorizontal: 24,
    marginTop: 24,
    padding: 4,
  },
  tabText: {
    color: colors.muted,
    fontFamily: fonts.semibold,
    fontSize: 16,
    lineHeight: 22,
  },
  tabTextActive: {
    color: colors.primary,
  },
  testActions: {
    gap: 10,
    marginTop: 15,
  },
  title: {
    color: colors.text,
    fontFamily: fonts.bold,
    fontSize: 24,
    letterSpacing: -0.45,
    lineHeight: 30,
  },
  validationCard: {
    backgroundColor: colors.white,
    borderColor: colors.border,
    borderRadius: 12,
    borderWidth: 1,
    padding: 16,
  },
  validationRule: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    gap: 9,
    marginTop: 10,
  },
  validationText: {
    color: colors.muted,
    flex: 1,
    fontFamily: fonts.regular,
    fontSize: 14,
    lineHeight: 20,
  },
  warningAlert: {
    backgroundColor: colors.warningBackground,
    borderColor: colors.warningBorder,
  },
});
