<?php
/**
 * Business details, editable in Appearance → Customize → "פרטי העסק".
 *
 * @package nachman
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * All theme options with their defaults.
 */
function np_defaults() {
	return array(
		'np_tagline'         => 'עריכת סרטים מקצועית במחיר שלא תאמינו',
		'np_hero_text'       => 'כל סוגי הסרטים עד חצי שעה, בעריכה משולבת AI ובאיכות 4K. שולחים חומרים ומקבלים סרט ערוך ומוכן, בלי חבילות מסובכות ובלי הפתעות במחיר.',
		'np_price_single'    => '20',
		'np_price_pack10'    => '180',
		'np_price_pack20'    => '350',
		'np_autoreply_on'    => false,
		'np_max_minutes'     => '30',
		'np_email'           => 'naftalinahar@gmail.com',
		'np_area'            => '',
		'np_wa_link'         => 'https://katzr.net/a60665',
		'np_phone'           => '058-448-8148',
		'np_instagram'       => '',
		'np_tiktok'          => '',
		'np_youtube'         => '',
		'np_facebook'        => '',
		'np_videos'          => "https://drive.google.com/file/d/1VG1rvZA35UCtomx29U9ZYCb8sYqqtK46/view | יום הולדת 40 לאמא!",
		'np_promo'           => "https://drive.google.com/file/d/1mRkvjH0e5glTvS0nBd18r7ZS8EXwjFYJ/view | נחמן הפקות – פרסומת",
		'np_about_title'     => 'היי, אני נחמן פומברג 👋',
		'np_about'           => "אני בן 10, הבן של נפתלי ותהילה פומברג, ואני עורך סרטים כבר שנה. בשנה הזאת ערכתי יותר מ-60 סרטים, ולמדתי מכל אחד מהם משהו חדש.\n\nאני מאמין שלכל אחד מגיע סרט ערוך ויפה, בלי לשלם על זה הון. בגלל זה המחירים שלי נמוכים במיוחד, אבל ההשקעה בכל סרט היא מלאה.\n\nאני עובד עם ארבעה כלי עריכה ביחד, ומשלב בינה מלאכותית בכל עריכה. ככה אני עובד מהר, שומר על איכות של עד 4K, ויכול להציע מחירים שקשה להאמין להם.\n\nכל סרט שמגיע אליי מקבל יחס אישי: אני מקשיב למה שאתם רוצים, ועורך אותו כאילו הוא שלי.",
		'np_about_photo'     => '',
		'np_autoreply'       => "שלום {name},\n\nתודה שפנית לנחמן הפקות! קיבלנו את הבקשה שלך לעריכת סרט.\n\nכדי שנוכל להתחיל, אפשר פשוט להשיב למייל הזה ולצרף את החומרים לסרט:\n• סרטונים ותמונות (לקבצים גדולים: קישור Google Drive או WeTransfer)\n• מוזיקה, אם יש שיר מסוים שרוצים\n• טקסטים, כתוביות או שמות שצריכים להופיע\n• כל הערה על הסגנון שאתם רוצים\n\nהחבילה שבחרת: {price}\n\nנחזור אליך בהקדם,\nנחמן הפקות",
	);
}

/**
 * Get an option value with its default.
 */
function np_opt( $key ) {
	$defaults = np_defaults();
	$value    = get_theme_mod( $key, isset( $defaults[ $key ] ) ? $defaults[ $key ] : '' );
	return is_string( $value ) ? trim( $value ) : $value;
}

/**
 * Register Customizer settings.
 */
function np_customize_register( $wp_customize ) {
	$wp_customize->add_section(
		'np_business',
		array(
			'title'       => 'פרטי העסק – נחמן הפקות',
			'priority'    => 20,
			'description' => 'כאן מעדכנים מחירים, מייל, רשתות חברתיות. שדה ריק פשוט לא יוצג באתר.',
		)
	);

	$fields = array(
		'np_tagline'         => array( 'כותרת ראשית', 'text', 'sanitize_text_field' ),
		'np_hero_text'       => array( 'טקסט פתיחה', 'textarea', 'sanitize_textarea_field' ),
		'np_price_single'    => array( 'מחיר לסרטון בודד (₪)', 'number', 'np_sanitize_number' ),
		'np_price_pack10'    => array( 'מחיר חבילת 10 סרטונים (₪)', 'number', 'np_sanitize_number' ),
		'np_price_pack20'    => array( 'מחיר חבילת 20 סרטונים (₪)', 'number', 'np_sanitize_number' ),
		'np_max_minutes'     => array( 'אורך מקסימלי לסרטון (דקות)', 'number', 'absint' ),
		'np_email'           => array( 'אימייל (גם לקבלת פניות מהטופס)', 'email', 'sanitize_email' ),
		'np_phone'           => array( 'טלפון (מוצג בתחתית האתר)', 'text', 'sanitize_text_field' ),
		'np_wa_link'         => array( 'קישור לפנייה בוואצאפ (ריק = לא מוצג)', 'url', 'esc_url_raw' ),
		'np_area'            => array( 'אזור שירות / הערה', 'text', 'sanitize_text_field' ),
		'np_instagram'       => array( 'קישור לאינסטגרם', 'url', 'esc_url_raw' ),
		'np_tiktok'          => array( 'קישור לטיקטוק', 'url', 'esc_url_raw' ),
		'np_youtube'         => array( 'קישור לערוץ יוטיוב', 'url', 'esc_url_raw' ),
		'np_facebook'        => array( 'קישור לפייסבוק', 'url', 'esc_url_raw' ),
		'np_videos'          => array( 'סרטונים לדוגמה – בכל שורה: קישור (גוגל דרייב או יוטיוב) | כותרת. בדרייב הקובץ צריך להיות משותף לכל מי שיש לו קישור', 'textarea', 'sanitize_textarea_field' ),
		'np_promo'           => array( 'סרטון "עדיין לא משוכנעים?" בסוף העמוד – קישור (גוגל דרייב או יוטיוב) | כותרת', 'textarea', 'sanitize_textarea_field' ),
		'np_about_title'     => array( 'מי אני – כותרת', 'text', 'sanitize_text_field' ),
		'np_about'           => array( 'מי אני – טקסט (שורה ריקה = פסקה חדשה)', 'textarea', 'sanitize_textarea_field' ),
		'np_autoreply_on'    => array( 'לשלוח ללקוח מייל תשובה אוטומטי', 'checkbox', 'wp_validate_boolean' ),
		'np_autoreply'       => array( 'נוסח המייל האוטומטי. אפשר להשתמש ב-{name} (שם הלקוח) וב-{price} (החבילה והמחיר)', 'textarea', 'sanitize_textarea_field' ),
	);

	$defaults = np_defaults();

	$wp_customize->add_setting( 'np_about_photo', array( 'default' => '', 'sanitize_callback' => 'esc_url_raw' ) );
	$wp_customize->add_control(
		new WP_Customize_Image_Control(
			$wp_customize,
			'np_about_photo',
			array(
				'label'       => 'מי אני – תמונה של נחמן',
				'description' => 'אפשר להחליף את התמונה של נחמן בתמונה אחרת.',
				'section'     => 'np_business',
				'priority'    => 200,
			)
		)
	);

	foreach ( $fields as $key => $f ) {
		$wp_customize->add_setting(
			$key,
			array(
				'default'           => $defaults[ $key ],
				'sanitize_callback' => $f[2],
			)
		);
		$wp_customize->add_control(
			$key,
			array(
				'label'   => $f[0],
				'section' => 'np_business',
				'type'    => $f[1],
			)
		);
	}
}
add_action( 'customize_register', 'np_customize_register' );

/**
 * Price packages: key => [label, number of videos, total price].
 */
function np_packages() {
	return array(
		'single' => array( 'סרטון בודד', 1, (float) np_opt( 'np_price_single' ) ),
		'pack10' => array( 'חבילת 10 סרטונים', 10, (float) np_opt( 'np_price_pack10' ) ),
		'pack20' => array( 'חבילת 20 סרטונים', 20, (float) np_opt( 'np_price_pack20' ) ),
	);
}

/**
 * Sanitize a non-negative decimal number.
 */
function np_sanitize_number( $value ) {
	$value = (float) str_replace( ',', '.', (string) $value );
	return (string) max( 0, $value );
}

/**
 * Sanitize a list of URLs, one per line.
 */
function np_sanitize_lines( $value ) {
	$lines = preg_split( '/\r\n|\r|\n/', (string) $value );
	$clean = array();
	foreach ( $lines as $line ) {
		$line = esc_url_raw( trim( $line ) );
		if ( $line ) {
			$clean[] = $line;
		}
	}
	return implode( "\n", $clean );
}
