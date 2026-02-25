// Delegates entirely to the shared, validated SampleRequestForm component.
import SampleRequestForm from '../shared/SampleRequestForm';

const INSURANCE_VOLUME_OPTIONS = [
  { value: '', label: 'Select a range...' },
  { value: 'Under 50 clients', label: 'Under 50 clients' },
  { value: '50-200 clients', label: '50-200 clients' },
  { value: '200-500 clients', label: '200-500 clients' },
  { value: '500+ clients', label: '500+ clients' },
];

export default function InsuranceSampleForm() {
  return (
    <SampleRequestForm
      source="insurance"
      accentColor="#FF7A00"
      bgColor="#213659"
      businessLabel="Agency Name or Website"
      businessPlaceholder="myagency.com or My Insurance Agency"
      productLabel="What type of insurance do you sell?"
      productPlaceholder="e.g. auto, home, life, commercial"
      volumeLabel="Approximate active client book size"
      volumeOptions={INSURANCE_VOLUME_OPTIONS}
      bookCallAnchor="schedule-demo"
    />
  );
}