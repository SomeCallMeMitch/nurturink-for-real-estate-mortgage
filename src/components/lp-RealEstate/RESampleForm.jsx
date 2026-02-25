// Delegates entirely to the shared, validated SampleRequestForm component.
import SampleRequestForm from '../shared/SampleRequestForm';

const RE_VOLUME_OPTIONS = [
  { value: '', label: 'Select a range...' },
  { value: 'Under 5 transactions/month', label: 'Under 5 transactions/month' },
  { value: '5-20 transactions/month', label: '5-20 transactions/month' },
  { value: '20-50 transactions/month', label: '20-50 transactions/month' },
  { value: '50+ transactions/month', label: '50+ transactions/month' },
];

export default function RESampleForm() {
  return (
    <SampleRequestForm
      source="real_estate"
      accentColor="#007bff"
      bgColor="#1a2d4a"
      businessLabel="Brokerage or Team Name"
      businessPlaceholder="My Real Estate Team or myrealty.com"
      productLabel="What's your primary focus?"
      productPlaceholder="e.g. residential buyers, luxury listings, commercial"
      volumeLabel="Approximate monthly transactions"
      volumeOptions={RE_VOLUME_OPTIONS}
      bookCallAnchor="schedule-demo"
    />
  );
}