import { useState } from 'react';
import { ArrowLeft, ArrowRight, CheckCircle2, Store, User, Phone, MapPin, Sprout, Leaf, TrendingUp, ShieldCheck, Truck, DollarSign } from 'lucide-react';
import type { Page, ProduceType } from '@/types';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/components/Toast';

interface SellOnFarmConnectPageProps {
  navigate: (page: Page) => void;
}

const STEPS = [
  { num: 1, label: 'Farm Details', icon: Store },
  { num: 2, label: 'Contact Info', icon: User },
  { num: 3, label: 'Produce Type', icon: Sprout },
];

const BENEFITS = [
  { icon: TrendingUp, title: 'Fair prices, no middlemen', desc: 'Set your own prices and keep up to 80% of every sale.' },
  { icon: Truck, title: 'We handle delivery', desc: 'Our logistics partners pick up and deliver your produce.' },
  { icon: ShieldCheck, title: 'Verified badge', desc: 'Get a verified farm badge that customers trust.' },
  { icon: DollarSign, title: 'Fast payments', desc: 'Receive payments directly to your bank within 48 hours.' },
];

export function SellOnFarmConnectPage({ navigate }: SellOnFarmConnectPageProps) {
  const { show } = useToast();
  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const [farmName, setFarmName] = useState('');
  const [ownerName, setOwnerName] = useState('');
  const [phone, setPhone] = useState('');
  const [location, setLocation] = useState('');
  const [produceType, setProduceType] = useState<ProduceType>('both');

  const canProceed = () => {
    if (step === 1) return farmName.trim().length > 0 && location.trim().length > 0;
    if (step === 2) return ownerName.trim().length > 0 && phone.trim().length >= 10;
    return true;
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const { error } = await supabase.from('farmer_applications').insert({
        farm_name: farmName.trim(),
        owner_name: ownerName.trim(),
        phone: phone.trim(),
        location: location.trim(),
        produce_type: produceType,
        status: 'pending',
      });
      if (error) throw error;
      setSubmitted(true);
      show('Application submitted!', 'success');
    } catch {
      show('Could not submit application. Please try again.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-12">
        <div className="text-center animate-scale-in">
          <div className="w-20 h-20 rounded-full bg-primary-100 flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="w-12 h-12 text-primary-600" />
          </div>
          <h1 className="font-display text-3xl font-semibold text-neutral-900">Application received!</h1>
          <p className="mt-3 text-neutral-500 max-w-md mx-auto">
            Thank you for applying to sell on FarmConnect. Our team will review your application and reach out within 2-3 business days to set up your digital shop.
          </p>
          <div className="mt-8 bg-white rounded-2xl border border-neutral-200/60 shadow-sm p-6 text-left max-w-md mx-auto">
            <h3 className="font-semibold text-neutral-900 mb-3">What happens next?</h3>
            <div className="space-y-3">
              {[
                'We review your farm details and produce type',
                'A team member calls you to verify your information',
                'Your digital shop goes live on FarmConnect',
                'You start receiving orders from nearby customers',
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-full bg-primary-100 text-primary-700 text-xs font-bold flex items-center justify-center shrink-0">
                    {i + 1}
                  </div>
                  <p className="text-sm text-neutral-600">{item}</p>
                </div>
              ))}
            </div>
          </div>
          <button
            onClick={() => navigate({ name: 'farmer-dashboard' })}
            className="mt-6 inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-primary-600 text-white font-semibold shadow-sm hover:bg-primary-700 transition-all"
          >
            View farmer dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Hero */}
      <section className="bg-gradient-to-br from-primary-50 via-white to-secondary-50 border-b border-neutral-200/60">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
          <div className="text-center max-w-2xl mx-auto animate-fade-in-up">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary-100 text-primary-700 text-sm font-semibold mb-4">
              <Leaf className="w-4 h-4" />
              Join 200+ farmers on FarmConnect
            </div>
            <h1 className="font-display text-3xl sm:text-4xl lg:text-5xl font-semibold text-neutral-900 leading-tight">
              Sell your produce directly to customers
            </h1>
            <p className="mt-4 text-lg text-neutral-600">
              Set up your digital farm shop in minutes. Reach thousands of customers in your area and earn fair prices for your hard work.
            </p>
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {BENEFITS.map(({ icon: Icon, title, desc }, i) => (
            <div
              key={title}
              style={{ animationDelay: `${i * 80}ms` }}
              className="animate-fade-in-up bg-white rounded-2xl border border-neutral-200/60 p-5 shadow-sm"
            >
              <div className="w-10 h-10 rounded-xl bg-primary-50 flex items-center justify-center mb-3">
                <Icon className="w-5 h-5 text-primary-600" />
              </div>
              <h3 className="font-semibold text-sm text-neutral-900 mb-1">{title}</h3>
              <p className="text-xs text-neutral-500 leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Application form */}
      <section className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <div className="bg-white rounded-2xl border border-neutral-200/60 shadow-sm overflow-hidden">
          {/* Stepper */}
          <div className="px-6 pt-6">
            <div className="flex items-center justify-between">
              {STEPS.map((s, i) => {
                const isActive = step === s.num;
                const isComplete = step > s.num;
                const Icon = s.icon;
                return (
                  <div key={s.num} className="flex items-center flex-1 last:flex-none">
                    <div className="flex flex-col items-center gap-1.5">
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                          isComplete
                            ? 'bg-primary-600 text-white'
                            : isActive
                            ? 'bg-primary-100 text-primary-700 ring-4 ring-primary-50'
                            : 'bg-neutral-100 text-neutral-400'
                        }`}
                      >
                        {isComplete ? <CheckCircle2 className="w-5 h-5" /> : <Icon className="w-5 h-5" />}
                      </div>
                      <span className={`text-xs font-medium ${isActive || isComplete ? 'text-neutral-900' : 'text-neutral-400'}`}>
                        {s.label}
                      </span>
                    </div>
                    {i < STEPS.length - 1 && (
                      <div className={`flex-1 h-0.5 mx-2 -mt-5 ${step > s.num ? 'bg-primary-500' : 'bg-neutral-200'}`} />
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Form body */}
          <div className="p-6 pt-8">
            {step === 1 && (
              <div className="space-y-4 animate-fade-in">
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1.5">Farm / Shop name</label>
                  <div className="relative">
                    <Store className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
                    <input
                      type="text"
                      value={farmName}
                      onChange={e => setFarmName(e.target.value)}
                      placeholder="e.g. Green Valley Farm"
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-neutral-200 text-sm focus:outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-100"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1.5">Farm location</label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
                    <input
                      type="text"
                      value={location}
                      onChange={e => setLocation(e.target.value)}
                      placeholder="e.g. Green Valley, Pune outskirts"
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-neutral-200 text-sm focus:outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-100"
                    />
                  </div>
                  <p className="mt-1.5 text-xs text-neutral-400">Customers will see this as your farm's location</p>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-4 animate-fade-in">
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1.5">Your name</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
                    <input
                      type="text"
                      value={ownerName}
                      onChange={e => setOwnerName(e.target.value)}
                      placeholder="e.g. Rajesh Patel"
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-neutral-200 text-sm focus:outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-100"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1.5">Phone number</label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
                    <input
                      type="tel"
                      value={phone}
                      onChange={e => setPhone(e.target.value)}
                      placeholder="+91 98765 43210"
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-neutral-200 text-sm focus:outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-100"
                    />
                  </div>
                  <p className="mt-1.5 text-xs text-neutral-400">We'll call you on this number to verify your farm</p>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-4 animate-fade-in">
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1.5">What do you grow?</label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {[
                      { key: 'vegetables' as const, label: 'Vegetables', icon: Sprout },
                      { key: 'fruits' as const, label: 'Fruits', icon: Sprout },
                      { key: 'both' as const, label: 'Both', icon: Sprout },
                    ].map(({ key, label }) => (
                      <button
                        key={key}
                        onClick={() => setProduceType(key)}
                        className={`flex flex-col items-center gap-2 p-4 rounded-xl border transition-all ${
                          produceType === key
                            ? 'border-primary-500 bg-primary-50 text-primary-700'
                            : 'border-neutral-200 text-neutral-600 hover:border-primary-300'
                        }`}
                      >
                        <Sprout className="w-6 h-6" />
                        <span className="text-sm font-semibold">{label}</span>
                      </button>
                    ))}
                  </div>
                </div>
                <div className="bg-neutral-50 rounded-xl p-4">
                  <p className="text-sm text-neutral-600">
                    You'll be able to add individual products, set prices, and manage inventory once your shop is approved.
                  </p>
                </div>
              </div>
            )}

            {/* Navigation */}
            <div className="mt-6 flex items-center justify-between">
              {step > 1 ? (
                <button
                  onClick={() => setStep(step - 1)}
                  className="inline-flex items-center gap-1.5 text-sm font-semibold text-neutral-500 hover:text-neutral-700"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Back
                </button>
              ) : (
                <button
                  onClick={() => navigate({ name: 'home' })}
                  className="inline-flex items-center gap-1.5 text-sm font-semibold text-neutral-500 hover:text-neutral-700"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Cancel
                </button>
              )}

              {step < 3 ? (
                <button
                  onClick={() => setStep(step + 1)}
                  disabled={!canProceed()}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary-600 text-white text-sm font-semibold shadow-sm hover:bg-primary-700 transition-all disabled:opacity-40 disabled:cursor-not-allowed active:scale-95"
                >
                  Continue
                  <ArrowRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  onClick={handleSubmit}
                  disabled={submitting}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary-600 text-white text-sm font-semibold shadow-sm hover:bg-primary-700 transition-all disabled:opacity-60 active:scale-95"
                >
                  {submitting ? 'Submitting...' : 'Submit application'}
                </button>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
