// Delegates entirely to the shared, validated SampleRequestForm component.
import SampleRequestForm from '../shared/SampleRequestForm';

const SOLAR_VOLUME_OPTIONS = [
  { value: '', label: 'Select a range...' },
  { value: 'Under 10 jobs/month', label: 'Under 10 jobs/month' },
  { value: '10-50 jobs/month', label: '10-50 jobs/month' },
  { value: '50-200 jobs/month', label: '50-200 jobs/month' },
  { value: '200+ jobs/month', label: '200+ jobs/month' },
];

export default function SolarSampleForm() {
  return (
    <SampleRequestForm
      source="solar"
      accentColor="#FF7A00"
      bgColor="#213659"
      businessLabel="Company Name or Website"
      businessPlaceholder="mycompany.com or My Solar Company"
      productLabel="What does your company do?"
      productPlaceholder="e.g. residential solar installations"
      volumeLabel="Approximate monthly jobs"
      volumeOptions={SOLAR_VOLUME_OPTIONS}
      bookCallAnchor="book-call"
    />
  );
}