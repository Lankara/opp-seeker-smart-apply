import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type CVFormat = 'modern' | 'classic' | 'creative' | 'minimal';

interface Experience {
  id?: string;
  company_name: string;
  position: string;
  start_date?: string;
  end_date?: string;
  is_current: boolean;
  description?: string;
}

interface Education {
  id?: string;
  institution: string;
  degree: string;
  field_of_study?: string;
  start_date?: string;
  end_date?: string;
  grade?: string;
}

interface PersonalDetails {
  full_name: string;
  email: string;
  phone: string;
  address: string;
  summary: string;
  profile_picture_url?: string;
}

interface CVRendererProps {
  format: CVFormat;
  personalDetails: PersonalDetails;
  experiences: Experience[];
  education: Education[];
}

const formatDate = (dateString: string) => {
  if (!dateString) return '';
  return new Date(dateString).toLocaleDateString('en-US', { 
    month: 'short', 
    year: 'numeric' 
  });
};

const ModernFormat = ({ personalDetails, experiences, education }: Omit<CVRendererProps, 'format'>) => (
  <div className="space-y-6">
    {/* Header with gradient background */}
    <Card className="bg-gradient-subtle border-0 shadow-elevation">
      <CardHeader className="text-center pb-6">
        <div className="flex flex-col items-center gap-4">
          {personalDetails.profile_picture_url && (
            <img
              src={personalDetails.profile_picture_url}
              alt="Profile"
              className="w-24 h-24 rounded-full object-cover border-4 border-primary/20 shadow-soft"
            />
          )}
          <CardTitle className="text-3xl font-bold bg-gradient-primary bg-clip-text text-transparent">
            {personalDetails.full_name || 'Your Name'}
          </CardTitle>
        </div>
        <div className="space-y-2 text-muted-foreground">
          {personalDetails.email && <p className="text-sm">{personalDetails.email}</p>}
          {personalDetails.phone && <p className="text-sm">{personalDetails.phone}</p>}
          {personalDetails.address && <p className="text-sm">{personalDetails.address}</p>}
        </div>
      </CardHeader>
      {personalDetails.summary && (
        <CardContent className="pt-0">
          <div className="bg-background/50 rounded-lg p-4 backdrop-blur-sm">
            <h3 className="font-semibold text-primary mb-2">Professional Summary</h3>
            <p className="text-muted-foreground leading-relaxed">{personalDetails.summary}</p>
          </div>
        </CardContent>
      )}
    </Card>

    {/* Experience */}
    {experiences.length > 0 && (
      <Card className="shadow-soft">
        <CardHeader>
          <CardTitle className="text-xl text-primary border-b border-primary/20 pb-2">
            Professional Experience
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {experiences.filter(exp => exp.company_name && exp.position).map((experience, index) => (
            <div key={index} className="relative pl-6 border-l-2 border-primary/30">
              <div className="absolute w-3 h-3 bg-primary rounded-full -left-[7px] top-1"></div>
              <div className="space-y-2">
                <div className="flex flex-col md:flex-row md:justify-between md:items-start">
                  <div>
                    <h3 className="font-semibold text-lg text-foreground">{experience.position}</h3>
                    <p className="text-primary font-medium">{experience.company_name}</p>
                  </div>
                  <div className="text-sm text-muted-foreground bg-accent/30 px-3 py-1 rounded-full">
                    {experience.start_date && (
                      <>
                        {formatDate(experience.start_date)}
                        {' - '}
                        {experience.is_current ? 'Present' : formatDate(experience.end_date)}
                      </>
                    )}
                  </div>
                </div>
                {experience.description && (
                  <p className="text-muted-foreground leading-relaxed">{experience.description}</p>
                )}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    )}

    {/* Education */}
    {education.length > 0 && (
      <Card className="shadow-soft">
        <CardHeader>
          <CardTitle className="text-xl text-primary border-b border-primary/20 pb-2">
            Education
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {education.filter(edu => edu.institution && edu.degree).map((edu, index) => (
            <div key={index} className="relative pl-6 border-l-2 border-primary/30">
              <div className="absolute w-3 h-3 bg-primary rounded-full -left-[7px] top-1"></div>
              <div className="space-y-2">
                <div className="flex flex-col md:flex-row md:justify-between md:items-start">
                  <div>
                    <h3 className="font-semibold text-lg text-foreground">{edu.degree}</h3>
                    <p className="text-primary font-medium">{edu.institution}</p>
                    {edu.field_of_study && (
                      <p className="text-muted-foreground">{edu.field_of_study}</p>
                    )}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {edu.start_date && (
                      <div className="bg-accent/30 px-3 py-1 rounded-full">
                        {formatDate(edu.start_date)}
                        {edu.end_date && ` - ${formatDate(edu.end_date)}`}
                      </div>
                    )}
                    {edu.grade && (
                      <div className="mt-1 text-center text-primary font-medium">Grade: {edu.grade}</div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    )}
  </div>
);

const ClassicFormat = ({ personalDetails, experiences, education }: Omit<CVRendererProps, 'format'>) => (
  <div className="space-y-4">
    {/* Header - Traditional style */}
    <Card className="border-2 border-foreground/20">
      <CardHeader className="text-center border-b border-foreground/10">
        <div className="flex flex-col items-center gap-3">
          {personalDetails.profile_picture_url && (
            <img
              src={personalDetails.profile_picture_url}
              alt="Profile"
              className="w-20 h-20 rounded-full object-cover border-2 border-foreground/30"
            />
          )}
          <CardTitle className="text-2xl font-bold text-foreground uppercase tracking-wide">
            {personalDetails.full_name || 'Your Name'}
          </CardTitle>
        </div>
        <div className="space-y-1 text-foreground/80 text-sm">
          {personalDetails.email && <p>{personalDetails.email}</p>}
          {personalDetails.phone && <p>{personalDetails.phone}</p>}
          {personalDetails.address && <p>{personalDetails.address}</p>}
        </div>
      </CardHeader>
      {personalDetails.summary && (
        <CardContent className="pt-4">
          <h3 className="font-bold text-foreground uppercase tracking-wide mb-2 border-b border-foreground/20 pb-1">
            Professional Summary
          </h3>
          <p className="text-foreground/80 text-sm leading-relaxed">{personalDetails.summary}</p>
        </CardContent>
      )}
    </Card>

    {/* Experience - Traditional formatting */}
    {experiences.length > 0 && (
      <Card className="border-2 border-foreground/20">
        <CardHeader>
          <CardTitle className="text-lg font-bold text-foreground uppercase tracking-wide border-b border-foreground/20 pb-1">
            Professional Experience
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {experiences.filter(exp => exp.company_name && exp.position).map((experience, index) => (
            <div key={index} className="border-b border-foreground/10 pb-3 last:border-b-0">
              <div className="flex flex-col md:flex-row md:justify-between md:items-start">
                <div>
                  <h3 className="font-bold text-foreground">{experience.position}</h3>
                  <p className="font-semibold text-foreground/80">{experience.company_name}</p>
                </div>
                <div className="text-sm text-foreground/70 font-medium">
                  {experience.start_date && (
                    <>
                      {formatDate(experience.start_date)}
                      {' - '}
                      {experience.is_current ? 'Present' : formatDate(experience.end_date)}
                    </>
                  )}
                </div>
              </div>
              {experience.description && (
                <p className="mt-2 text-foreground/80 text-sm">{experience.description}</p>
              )}
            </div>
          ))}
        </CardContent>
      </Card>
    )}

    {/* Education - Traditional formatting */}
    {education.length > 0 && (
      <Card className="border-2 border-foreground/20">
        <CardHeader>
          <CardTitle className="text-lg font-bold text-foreground uppercase tracking-wide border-b border-foreground/20 pb-1">
            Education
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {education.filter(edu => edu.institution && edu.degree).map((edu, index) => (
            <div key={index} className="border-b border-foreground/10 pb-3 last:border-b-0">
              <div className="flex flex-col md:flex-row md:justify-between md:items-start">
                <div>
                  <h3 className="font-bold text-foreground">{edu.degree}</h3>
                  <p className="font-semibold text-foreground/80">{edu.institution}</p>
                  {edu.field_of_study && (
                    <p className="text-foreground/70">{edu.field_of_study}</p>
                  )}
                </div>
                <div className="text-sm text-foreground/70">
                  {edu.start_date && (
                    <div>
                      {formatDate(edu.start_date)}
                      {edu.end_date && ` - ${formatDate(edu.end_date)}`}
                    </div>
                  )}
                  {edu.grade && (
                    <div className="font-medium">Grade: {edu.grade}</div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    )}
  </div>
);

const CreativeFormat = ({ personalDetails, experiences, education }: Omit<CVRendererProps, 'format'>) => (
  <div className="space-y-6">
    {/* Header with creative styling */}
    <Card className="bg-gradient-hero border-0 shadow-glow relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-accent/10"></div>
      <CardHeader className="text-center pb-6 relative z-10">
        <div className="flex flex-col items-center gap-4">
          {personalDetails.profile_picture_url && (
            <img
              src={personalDetails.profile_picture_url}
              alt="Profile"
              className="w-28 h-28 rounded-full object-cover border-4 border-primary-foreground/30 shadow-glow"
            />
          )}
          <CardTitle className="text-4xl font-bold text-primary-foreground mb-4 drop-shadow-sm">
            {personalDetails.full_name || 'Your Name'}
          </CardTitle>
        </div>
        <div className="flex flex-wrap justify-center gap-4 text-primary-foreground/90">
          {personalDetails.email && (
            <div className="bg-primary-foreground/20 px-3 py-1 rounded-full text-sm backdrop-blur-sm">
              {personalDetails.email}
            </div>
          )}
          {personalDetails.phone && (
            <div className="bg-primary-foreground/20 px-3 py-1 rounded-full text-sm backdrop-blur-sm">
              {personalDetails.phone}
            </div>
          )}
          {personalDetails.address && (
            <div className="bg-primary-foreground/20 px-3 py-1 rounded-full text-sm backdrop-blur-sm">
              {personalDetails.address}
            </div>
          )}
        </div>
      </CardHeader>
      {personalDetails.summary && (
        <CardContent className="pt-0 relative z-10">
          <div className="bg-primary-foreground/10 rounded-lg p-4 backdrop-blur-sm border border-primary-foreground/20">
            <h3 className="font-bold text-primary-foreground mb-2 text-lg">✨ Professional Summary</h3>
            <p className="text-primary-foreground/90 leading-relaxed">{personalDetails.summary}</p>
          </div>
        </CardContent>
      )}
    </Card>

    {/* Experience with creative elements */}
    {experiences.length > 0 && (
      <Card className="shadow-elevation border-0 bg-gradient-subtle">
        <CardHeader>
          <CardTitle className="text-2xl text-primary flex items-center gap-2">
            🚀 Professional Journey
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {experiences.filter(exp => exp.company_name && exp.position).map((experience, index) => (
            <div key={index} className="bg-background/80 rounded-lg p-4 shadow-soft border border-primary/10">
              <div className="flex flex-col md:flex-row md:justify-between md:items-start mb-3">
                <div>
                  <h3 className="font-bold text-lg text-foreground flex items-center gap-2">
                    💼 {experience.position}
                  </h3>
                  <p className="text-primary font-semibold text-lg">{experience.company_name}</p>
                </div>
                <div className="bg-accent/50 text-accent-foreground px-3 py-1 rounded-full text-sm font-medium">
                  {experience.start_date && (
                    <>
                      {formatDate(experience.start_date)}
                      {' - '}
                      {experience.is_current ? 'Present' : formatDate(experience.end_date)}
                    </>
                  )}
                </div>
              </div>
              {experience.description && (
                <p className="text-muted-foreground leading-relaxed">{experience.description}</p>
              )}
            </div>
          ))}
        </CardContent>
      </Card>
    )}

    {/* Education with creative styling */}
    {education.length > 0 && (
      <Card className="shadow-elevation border-0 bg-gradient-subtle">
        <CardHeader>
          <CardTitle className="text-2xl text-primary flex items-center gap-2">
            🎓 Academic Background
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {education.filter(edu => edu.institution && edu.degree).map((edu, index) => (
            <div key={index} className="bg-background/80 rounded-lg p-4 shadow-soft border border-primary/10">
              <div className="flex flex-col md:flex-row md:justify-between md:items-start">
                <div>
                  <h3 className="font-bold text-lg text-foreground flex items-center gap-2">
                    📚 {edu.degree}
                  </h3>
                  <p className="text-primary font-semibold">{edu.institution}</p>
                  {edu.field_of_study && (
                    <p className="text-muted-foreground">{edu.field_of_study}</p>
                  )}
                </div>
                <div className="text-sm text-muted-foreground">
                  {edu.start_date && (
                    <div className="bg-accent/50 text-accent-foreground px-3 py-1 rounded-full font-medium">
                      {formatDate(edu.start_date)}
                      {edu.end_date && ` - ${formatDate(edu.end_date)}`}
                    </div>
                  )}
                  {edu.grade && (
                    <div className="mt-2 text-center bg-primary/10 text-primary px-2 py-1 rounded font-semibold">
                      Grade: {edu.grade}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    )}
  </div>
);

const MinimalFormat = ({ personalDetails, experiences, education }: Omit<CVRendererProps, 'format'>) => (
  <div className="space-y-8 max-w-4xl mx-auto">
    {/* Header - Ultra minimal */}
    <div className="text-center border-b border-border pb-6">
      <div className="flex flex-col items-center gap-4 mb-4">
        {personalDetails.profile_picture_url && (
          <img
            src={personalDetails.profile_picture_url}
            alt="Profile"
            className="w-20 h-20 rounded-full object-cover border border-border"
          />
        )}
        <h1 className="text-3xl font-light text-foreground tracking-wide">
          {personalDetails.full_name || 'Your Name'}
        </h1>
      </div>
      <div className="flex flex-wrap justify-center gap-6 text-sm text-muted-foreground">
        {personalDetails.email && <span>{personalDetails.email}</span>}
        {personalDetails.phone && <span>{personalDetails.phone}</span>}
        {personalDetails.address && <span>{personalDetails.address}</span>}
      </div>
      {personalDetails.summary && (
        <div className="mt-6 max-w-2xl mx-auto">
          <p className="text-muted-foreground leading-relaxed text-center">{personalDetails.summary}</p>
        </div>
      )}
    </div>

    {/* Experience - Minimal design */}
    {experiences.length > 0 && (
      <div>
        <h2 className="text-lg font-light text-foreground mb-6 tracking-wide">Experience</h2>
        <div className="space-y-6">
          {experiences.filter(exp => exp.company_name && exp.position).map((experience, index) => (
            <div key={index} className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:text-right">
                <div className="text-sm text-muted-foreground">
                  {experience.start_date && (
                    <>
                      {formatDate(experience.start_date)}
                      {' — '}
                      {experience.is_current ? 'Present' : formatDate(experience.end_date)}
                    </>
                  )}
                </div>
              </div>
              <div className="md:col-span-2">
                <h3 className="font-medium text-foreground">{experience.position}</h3>
                <p className="text-muted-foreground font-light">{experience.company_name}</p>
                {experience.description && (
                  <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{experience.description}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    )}

    {/* Education - Minimal design */}
    {education.length > 0 && (
      <div>
        <h2 className="text-lg font-light text-foreground mb-6 tracking-wide">Education</h2>
        <div className="space-y-6">
          {education.filter(edu => edu.institution && edu.degree).map((edu, index) => (
            <div key={index} className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:text-right">
                <div className="text-sm text-muted-foreground">
                  {edu.start_date && (
                    <>
                      {formatDate(edu.start_date)}
                      {edu.end_date && ` — ${formatDate(edu.end_date)}`}
                    </>
                  )}
                  {edu.grade && (
                    <div className="mt-1 text-xs">Grade: {edu.grade}</div>
                  )}
                </div>
              </div>
              <div className="md:col-span-2">
                <h3 className="font-medium text-foreground">{edu.degree}</h3>
                <p className="text-muted-foreground font-light">{edu.institution}</p>
                {edu.field_of_study && (
                  <p className="text-sm text-muted-foreground">{edu.field_of_study}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    )}
  </div>
);

export const CVRenderer = ({ format, personalDetails, experiences, education }: CVRendererProps) => {
  const formatComponents = {
    modern: ModernFormat,
    classic: ClassicFormat,
    creative: CreativeFormat,
    minimal: MinimalFormat,
  };

  const FormatComponent = formatComponents[format];

  return (
    <div className="w-full">
      <FormatComponent
        personalDetails={personalDetails}
        experiences={experiences}
        education={education}
      />
    </div>
  );
};