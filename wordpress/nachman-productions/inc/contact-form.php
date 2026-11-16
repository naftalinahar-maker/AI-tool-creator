<?php
/**
 * Contact form handler: sends the request by email to the business address.
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
		wp_safe_redirect( add_query_arg( 'np_sent', 'error', $back ) . '#contact' );
		exit;
	}

	// Honeypot: bots fill hidden fields.
	if ( ! empty( $_POST['np_website'] ) ) {
		wp_safe_redirect( add_query_arg( 'np_sent', '1', $back ) . '#contact' );
		exit;
	}

	$name    = isset( $_POST['np_name'] ) ? sanitize_text_field( wp_unslash( $_POST['np_name'] ) ) : '';
	$phone   = isset( $_POST['np_phone'] ) ? sanitize_text_field( wp_unslash( $_POST['np_phone'] ) ) : '';
	$type    = isset( $_POST['np_type'] ) ? sanitize_text_field( wp_unslash( $_POST['np_type'] ) ) : '';
	$length  = isset( $_POST['np_length'] ) ? absint( $_POST['np_length'] ) : 0;
	$message = isset( $_POST['np_message'] ) ? sanitize_textarea_field( wp_unslash( $_POST['np_message'] ) ) : '';

	if ( '' === $name || '' === $phone ) {
		wp_safe_redirect( add_query_arg( 'np_sent', 'missing', $back ) . '#contact' );
		exit;
	}

	$to = np_opt( 'np_email' );
	if ( ! is_email( $to ) ) {
		$to = get_option( 'admin_email' );
	}

	$body  = "פנייה חדשה מהאתר – נחמן הפקות\n\n";
	$body .= "שם: {$name}\n";
	$body .= "טלפון: {$phone}\n";
	$body .= 'סוג הסרט: ' . ( $type ? $type : '—' ) . "\n";
	$body .= 'אורך משוער: ' . ( $length ? $length . ' דקות' : '—' ) . "\n\n";
	$body .= "הודעה:\n" . ( $message ? $message : '—' ) . "\n";

	$sent = wp_mail( $to, 'פנייה חדשה מהאתר: ' . $name, $body );

	wp_safe_redirect( add_query_arg( 'np_sent', $sent ? '1' : 'error', $back ) . '#contact' );
	exit;
}
add_action( 'admin_post_np_contact', 'np_handle_contact' );
add_action( 'admin_post_nopriv_np_contact', 'np_handle_contact' );
