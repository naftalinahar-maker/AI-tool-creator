<?php
/**
 * Contact form handler.
 *
 * The customer leaves a name and email. Two emails are sent:
 * 1. To Nachman: the request details (Reply-To = the customer).
 * 2. To the customer: an automatic reply asking them to answer with the
 *    materials for the film (Reply-To = Nachman), so their answer lands in his inbox.
 *
 * @package nachman
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Handle form submission (logged-in and guests).
 */
function np_handle_contact() {
	$back = wp_get_referer() ? wp_get_referer() : home_url( '/' );
	$back = remove_query_arg( 'np_sent', $back );

	if ( ! isset( $_POST['np_nonce'] ) || ! wp_verify_nonce( sanitize_text_field( wp_unslash( $_POST['np_nonce'] ) ), 'np_contact' ) ) {
		np_contact_redirect( $back, 'error' );
	}

	// Honeypot: bots fill hidden fields.
	if ( ! empty( $_POST['np_website'] ) ) {
		np_contact_redirect( $back, '1' );
	}

	$name    = isset( $_POST['np_name'] ) ? sanitize_text_field( wp_unslash( $_POST['np_name'] ) ) : '';
	$email   = isset( $_POST['np_email'] ) ? sanitize_email( wp_unslash( $_POST['np_email'] ) ) : '';
	$type    = isset( $_POST['np_type'] ) ? sanitize_text_field( wp_unslash( $_POST['np_type'] ) ) : '';
	$length  = isset( $_POST['np_length'] ) ? absint( $_POST['np_length'] ) : 0;
	$message = isset( $_POST['np_message'] ) ? sanitize_textarea_field( wp_unslash( $_POST['np_message'] ) ) : '';

	if ( '' === $name || ! is_email( $email ) ) {
		np_contact_redirect( $back, 'missing' );
	}

	// Simple rate limit: one request per email per minute.
	$lock = 'np_contact_' . md5( strtolower( $email ) );
	if ( get_transient( $lock ) ) {
		np_contact_redirect( $back, '1' );
	}
	set_transient( $lock, 1, MINUTE_IN_SECONDS );

	$owner = np_opt( 'np_email' );
	if ( ! is_email( $owner ) ) {
		$owner = get_option( 'admin_email' );
	}

	$price = '—';
	if ( $length ) {
		$block = max( 1, (int) np_opt( 'np_block_minutes' ) );
		$price = np_money( ceil( $length / $block ) * (float) np_opt( 'np_price_per_block' ) ) . " (סרט של {$length} דקות)";
	}

	// Names in headers must not contain line breaks or quotes.
	$safe_name = trim( str_replace( array( "\r", "\n", '"' ), '', $name ) );
	$site_name = 'נחמן הפקות';

	// 1) Notification to Nachman.
	$body  = "פנייה חדשה מהאתר – נחמן הפקות\n\n";
	$body .= "שם: {$name}\n";
	$body .= "מייל: {$email}\n";
	$body .= 'סוג הסרט: ' . ( $type ? $type : '—' ) . "\n";
	$body .= 'אורך משוער: ' . ( $length ? $length . ' דקות' : '—' ) . "\n";
	$body .= "מחיר משוער: {$price}\n\n";
	$body .= "הודעה:\n" . ( $message ? $message : '—' ) . "\n\n";
	$body .= "הלקוח קיבל מייל אוטומטי שמבקש ממנו להשיב עם החומרים. אפשר להשיב למייל הזה כדי לכתוב ללקוח ישירות.\n";

	$sent_owner = wp_mail(
		$owner,
		'פנייה חדשה מהאתר: ' . $name,
		$body,
		array( 'Reply-To: "' . $safe_name . '" <' . $email . '>' )
	);

	// 2) Automatic reply to the customer.
	$template = np_opt( 'np_autoreply' );
	if ( '' === $template ) {
		$defaults = np_defaults();
		$template = $defaults['np_autoreply'];
	}
	$reply = strtr( $template, array( '{name}' => $name, '{price}' => $price ) );
	if ( $type || $message ) {
		$reply .= "\n\n— — —\nסיכום הבקשה שלך:\n";
		$reply .= $type ? "סוג הסרט: {$type}\n" : '';
		$reply .= $length ? "אורך משוער: {$length} דקות\n" : '';
		$reply .= $message ? "הודעה: {$message}\n" : '';
	}

	$sent_customer = wp_mail(
		$email,
		$site_name . ' – קיבלנו את הבקשה! השיבו למייל הזה עם החומרים לסרט',
		$reply,
		array( 'Reply-To: "' . $site_name . '" <' . $owner . '>' )
	);

	np_contact_redirect( $back, ( $sent_owner || $sent_customer ) ? '1' : 'error' );
}
add_action( 'admin_post_np_contact', 'np_handle_contact' );
add_action( 'admin_post_nopriv_np_contact', 'np_handle_contact' );

/**
 * Redirect back to the contact section with a status flag.
 */
function np_contact_redirect( $back, $status ) {
	wp_safe_redirect( add_query_arg( 'np_sent', $status, $back ) . '#contact' );
	exit;
}

/**
 * Send site emails from the site's own domain with the business name,
 * instead of WordPress's default "WordPress <wordpress@…>".
 */
function np_mail_from_name( $name ) {
	return 'WordPress' === $name ? 'נחמן הפקות' : $name;
}
add_filter( 'wp_mail_from_name', 'np_mail_from_name' );
