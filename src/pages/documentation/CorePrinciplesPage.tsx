
import React from 'react';
import { PageLayout } from "@/components/layout/PageLayout";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";

const CorePrinciplesPage = () => {
  return (
    <PageLayout
      title="Core Principles of Bhagavad Gita"
      description="Understanding dharma, karma, and yoga - the foundational concepts"
    >
      <div className="mb-6">
        <Button variant="outline" asChild className="mb-8">
          <Link to="/documentation" className="flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" /> Back to Documentation
          </Link>
        </Button>
      </div>

      <div className="prose prose-lg dark:prose-invert max-w-none">
        <h2>Introduction to Core Principles</h2>
        <p>
          The Bhagavad Gita presents several core philosophical principles that form the foundation of its teachings. These concepts are not only central to understanding the text but also provide practical guidance for leading a purposeful and fulfilling life. Here, we explore these fundamental principles in depth.
        </p>

        <h2>Dharma: The Principle of Righteousness</h2>
        <p>
          Dharma is one of the most complex and profound concepts in Indian philosophy. Often translated as "duty," "righteousness," or "cosmic order," dharma encompasses the idea of living in accordance with one's purpose and the moral order of the universe.
        </p>

        <h3>Types of Dharma</h3>
        <ul>
          <li><strong>Samanya Dharma</strong> (Universal Duties): Ethical principles applicable to all, such as truthfulness, non-violence, compassion, and purity.</li>
          <li><strong>Vishesha Dharma</strong> (Specific Duties): Responsibilities specific to one's position in life, social role, profession, or stage of life.</li>
          <li><strong>Sva-dharma</strong> (Personal Duty): One's own unique path of righteousness based on one's nature, abilities, and circumstances.</li>
        </ul>

        <p>
          In the Gita, Krishna emphasizes that following one's sva-dharma, even imperfectly, is better than perfectly performing someone else's duty. He tells Arjuna: "Better is one's own dharma, though imperfectly performed, than the dharma of another well-performed. Better is death in one's own dharma; the dharma of another is fraught with fear." (3.35)
        </p>

        <h2>Karma: The Law of Action</h2>
        <p>
          Karma, often misunderstood as fate or predestination, is actually a sophisticated understanding of action and its consequences. The Gita presents a nuanced view of karma through several key teachings:
        </p>

        <h3>Karma Yoga</h3>
        <p>
          Karma Yoga is the path of selfless action. Krishna teaches that one should perform actions without attachment to their fruits (results). This detachment doesn't mean indifference or lack of effort, but rather performing actions out of duty and offering the results to the divine.
        </p>

        <blockquote>
          "You have a right to perform your prescribed duties, but you are not entitled to the fruits of your actions. Never consider yourself to be the cause of the results of your activities, nor be attached to inaction." (2.47)
        </blockquote>

        <h3>Types of Karma</h3>
        <ul>
          <li><strong>Sanchita Karma</strong>: The accumulated karma from all past lives, waiting to bear fruit.</li>
          <li><strong>Prarabdha Karma</strong>: The portion of Sanchita Karma that is being experienced in the current lifetime.</li>
          <li><strong>Agami Karma</strong>: The karma being created in the present life that will bear fruit in the future.</li>
        </ul>

        <h2>Yoga: Paths to Union with the Divine</h2>
        <p>
          The Gita outlines several yogic paths for spiritual realization, each suited to different temperaments and inclinations:
        </p>

        <h3>Jnana Yoga: The Path of Knowledge</h3>
        <p>
          Jnana Yoga involves discriminating between the real and unreal, the eternal and the temporary. It leads to the understanding that the true self (Atman) is identical with the ultimate reality (Brahman). This path requires intellectual discernment and meditation on philosophical truths.
        </p>

        <h3>Bhakti Yoga: The Path of Devotion</h3>
        <p>
          Bhakti Yoga is centered on loving devotion to the divine. It involves cultivating a relationship with God through worship, prayer, and surrender. Krishna states that this path is most accessible in the current age:
        </p>

        <blockquote>
          "For one who worships Me with unwavering devotion, transcending the three modes of material nature, is liberated and qualified to become one with Brahman." (14.26)
        </blockquote>

        <h3>Karma Yoga: The Path of Selfless Action</h3>
        <p>
          As discussed earlier, Karma Yoga involves performing one's duties without attachment to results. This path transforms mundane activities into spiritual practice by changing the consciousness behind the action.
        </p>

        <h3>Raja Yoga: The Path of Meditation</h3>
        <p>
          Raja Yoga, or the "royal path," focuses on controlling the mind through meditation and concentration. The sixth chapter of the Gita provides instructions on meditative practices, proper posture, and mental discipline.
        </p>

        <h2>The Gunas: Three Modes of Material Nature</h2>
        <p>
          The Gita describes three fundamental qualities (gunas) that constitute all of material existence:
        </p>

        <ul>
          <li><strong>Sattva</strong> (Goodness/Purity): Characterized by clarity, wisdom, peace, and harmony.</li>
          <li><strong>Rajas</strong> (Passion/Activity): Characterized by energy, desire, ambition, and attachment.</li>
          <li><strong>Tamas</strong> (Ignorance/Inertia): Characterized by darkness, delusion, negligence, and laziness.</li>
        </ul>

        <p>
          These gunas influence all aspects of life, from food choices to types of worship. Understanding and transcending the gunas is crucial for spiritual development.
        </p>

        <h2>The Concept of Self</h2>
        <p>
          Central to the Gita's philosophy is the distinction between the temporary body and the eternal self:
        </p>

        <ul>
          <li><strong>Atman</strong> (Self/Soul): The eternal, unchanging essence of a being, beyond birth and death.</li>
          <li><strong>Brahman</strong> (Ultimate Reality): The supreme, transcendent reality, of which Atman is a part.</li>
          <li><strong>Prakriti</strong> (Material Nature): The physical realm including the body, mind, and senses.</li>
        </ul>

        <p>
          Krishna teaches that realizing the eternal nature of the self and its distinction from the temporary body is key to overcoming fear, grief, and attachment.
        </p>

        <h2>Integration and Application</h2>
        <p>
          The genius of the Bhagavad Gita lies in its integration of these seemingly diverse principles into a coherent philosophy of life. It teaches that these paths are not mutually exclusive but complementary, and that an integrated approach combining knowledge, devotion, and action leads to the highest realization.
        </p>

        <p>
          In everyday application, these principles guide us to:
        </p>

        <ul>
          <li>Perform our duties with excellence but without attachment to results</li>
          <li>Cultivate wisdom through study, reflection, and meditation</li>
          <li>Develop devotion and surrender to a higher purpose</li>
          <li>Live with awareness of our eternal nature beyond the body</li>
          <li>Act from a place of balance, avoiding extremes of any kind</li>
        </ul>

        <p>
          By understanding and applying these core principles, we can navigate life's challenges with greater wisdom, purpose, and inner peace.
        </p>
      </div>
    </PageLayout>
  );
};

export default CorePrinciplesPage;
