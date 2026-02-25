// Delegates entirely to the shared, validated SampleRequestForm component.
import SampleRequestForm from '../shared/SampleRequestForm';

const ECOMMERCE_VOLUME_OPTIONS = [
  { value: '', label: 'Select a range...' },
  { value: 'Under 100 orders/month', label: 'Under 100 orders/month' },
  { value: '100-500 orders/month', label: '100-500 orders/month' },
  { value: '500-2,000 orders/month', label: '500-2,000 orders/month' },
  { value: '2,000-10,000 orders/month', label: '2,000-10,000 orders/month' },
  { value: '10,000+ orders/month', label: '10,000+ orders/month' },
];

export default function EcommerceSampleForm() {
  return (
    <SampleRequestForm
      source="ecommerce"
      accentColor="#FF7A00"
      bgColor="#213659"
      businessLabel="Store Name or URL"
      businessPlaceholder="mystore.com or My Store Name"
      productLabel="What do you sell?"
      productPlaceholder="e.g. candles, pet supplies, skincare"
      volumeLabel="Approximate monthly orders"
      volumeOptions={ECOMMERCE_VOLUME_OPTIONS}
      bookCallAnchor="book-call"
    />
  );
}